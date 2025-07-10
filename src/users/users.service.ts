import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { CreateUserRequest, SignupMethod } from './dto/create-user.request';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from '../common/email/email.service';
import { Role, User, Prisma } from '../../generated/prisma';
import { UpdateUserRequest } from './dto/update-user.request';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(data: CreateUserRequest): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Check if user already exists by email
      const existingUserByEmail = await tx.user.findFirst({
        where: { email: data.email },
      });
      if (existingUserByEmail) {
        throw new ConflictException('Email address is already registered');
      }

      // Check if username already exists
      const existingUserByUsername = await tx.user.findFirst({
        where: { username: data.username },
      });
      if (existingUserByUsername) {
        throw new ConflictException('Username is already taken');
      }

      // Check if RFID ID already exists (if provided)
      if (data.rfidId) {
        const existingUserByRfid = await tx.user.findFirst({
          where: { rfidId: data.rfidId },
        });
        if (existingUserByRfid) {
          throw new ConflictException('RFID card is already registered');
        }
      }

      // Generate email verification code
      const verificationCode = this.generateVerificationCode();

      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          username: data.username,
          password: await hash(data.password, 10),
          firstName: data.firstName,
          lastName: data.lastName,
          birthdate: data.birthdate ? new Date(data.birthdate) : null,
          course: data.course || '', // Set to empty string if not provided
          rfidId: data.rfidId,
          imageUrl: data.imageUrl || null, // Store profile image if provided
          emailVerified: false,
          emailVerificationCode: verificationCode,
          signupMethod: data.signupMethod ?? SignupMethod.EMAIL,
          roles: [Role.STUDENT],
        },
      });

      // Send verification email
      this.emailService.sendEmailVerification({
        email: user.email,
        firstName: user.firstName,
        verificationCode,
      });
    });
  }

  async getUser(where: {
    id?: string;
    email?: string;
    username?: string;
    rfidId?: string;
  }): Promise<User> {
    const user = await this.prisma.user.findFirst({ where });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUser(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ): Promise<User | null> {
    return await this.prisma.user.update({
      where,
      data,
    });
  }

  async getOrCreateUser(data: CreateUserRequest): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { email: data.email },
    });

    if (user) {
      if (user.imageUrl === null) {
        const updatedUser = await this.updateUser(
          { email: data.email },
          { imageUrl: data.imageUrl },
        );
        return updatedUser ?? user;
      }
      return user;
    }

    // For OAuth users, auto-verify email and generate username if not provided
    const username =
      data.username || this.generateUsernameFromEmail(data.email);

    const newUser = await this.prisma.user.create({
      data: {
        email: data.email,
        username,
        password: await hash(
          data.password || this.generateRandomPassword(),
          10,
        ),
        firstName: data.firstName,
        lastName: data.lastName,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        course: data.course || '', // Set to empty string if not provided
        rfidId: data.rfidId,
        imageUrl: data.imageUrl || null, // Store profile image from Google OAuth
        emailVerified: true, // Auto-verify for OAuth
        emailVerificationCode: null,
        roles: [Role.STUDENT],
        signupMethod: data.signupMethod ?? SignupMethod.EMAIL,
      },
    });
    try {
      await this.emailService.sendWelcomeEmail({
        email: newUser.email,
        firstName: newUser.firstName,
        username: newUser.username,
      });
    } catch (error) {
      console.error(error);
    }

    return newUser;
  }

  async findUserByResetToken(token: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: {
          gte: new Date(), // Check if token is not expired
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User with this reset token not found');
    }
    return user;
  }

  async sendEmailVerification(email: string): Promise<void> {
    const user = await this.getUser({ email });

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationCode = this.generateVerificationCode();

    await this.updateUser(
      { email },
      { emailVerificationCode: verificationCode },
    );

    await this.emailService.sendEmailVerification({
      email: user.email,
      firstName: user.firstName,
      verificationCode,
    });
  }

  async verifyEmail(email: string, verificationCode: string): Promise<void> {
    const user = await this.getUser({ email });

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (
      !user.emailVerificationCode ||
      user.emailVerificationCode !== verificationCode
    ) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.updateUser(
      { email },
      {
        emailVerified: true,
        emailVerificationCode: null,
      },
    );

    // Send welcome email
    await this.emailService.sendWelcomeEmail({
      email: user.email,
      firstName: user.firstName,
      username: user.username,
    });
  }

  async registerRfid(rfidId: string, email?: string): Promise<User> {
    // Check if RFID is already registered
    const existingRfidUser = await this.prisma.user.findFirst({
      where: { rfidId },
    });
    if (existingRfidUser) {
      throw new ConflictException('RFID card is already registered');
    }

    let user: User;

    if (email) {
      // Register RFID for existing user
      user = await this.getUser({ email });
      if (user.rfidId) {
        throw new ConflictException('User already has an RFID card registered');
      }

      await this.updateUser({ email }, { rfidId });
      user = await this.getUser({ email });
    } else {
      throw new BadRequestException('Email is required for RFID registration');
    }

    // Send RFID registration success email
    await this.emailService.sendRfidRegistrationSuccess({
      email: user.email,
      firstName: user.firstName,
      rfidId,
    });

    return user;
  }

  async loginWithRfid(rfidId: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { rfidId },
    });

    if (!user) {
      throw new UnauthorizedException('RFID card not registered');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before using RFID login',
      );
    }

    return user;
  }

  async updateUserProfile(
    where: { id?: string; email?: string; username?: string },
    data: UpdateUserRequest,
  ): Promise<User | null> {
    const { birthdate, ...rest } = data;
    const user = await this.prisma.user.update({
      where: { id: where.id },
      data: {
        ...rest,
        birthdate: birthdate ? new Date(birthdate) : null,
      },
    });
    return user;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateUsernameFromEmail(email: string): string {
    const baseName = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${baseName}${randomSuffix}`;
  }

  private generateRandomPassword(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async timeoutAllActiveUsers(): Promise<{
    message: string;
    totalTimedOut: number;
  }> {
    const result = await this.prisma.$transaction(async (tx) => {
      // Execute both operations in parallel within the transaction
      const [sessions, users] = await Promise.all([
        tx.facilityUsage.updateMany({
          where: {
            isActive: true,
          },
          data: {
            isActive: false,
            timeOut: new Date(),
          },
        }),
        tx.user.updateMany({
          where: {
            currentFacilityId: {
              not: null,
            },
          },
          data: {
            currentFacilityId: null,
          },
        }),
      ]);

      return {
        sessionsCount: sessions.count,
        usersCount: users.count,
      };
    });

    return {
      message:
        `Successfully timed out ${result.sessionsCount} sessions and ` +
        `cleared ${result.usersCount} user facilities`,
      totalTimedOut: result.sessionsCount,
    };
  }
}
