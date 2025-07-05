import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { CreateUserRequest } from './dto/create-user.request';
import { PrismaService } from '../common/prisma/prisma.service';
import { Role, User } from 'generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserRequest): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { email: data.email },
    });
    if (user) {
      throw new ConflictException('User already exists');
    }
    await this.prisma.user.create({
      data: {
        ...data,
        password: await hash(data.password, 10),
        roles: [Role.USER],
      },
    });
  }

  async getUser(where: { id?: string; email?: string }): Promise<User> {
    const user = await this.prisma.user.findFirst({ where });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany({});
  }

  async updateUser(
    where: { id?: string; email?: string },
    data: { refreshToken?: string },
  ): Promise<User | null> {
    await this.prisma.user.updateMany({
      where,
      data,
    });
    return this.prisma.user.findFirst({ where });
  }

  async getOrCreateUser(data: CreateUserRequest): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { email: data.email },
    });
    if (user) {
      return user;
    }
    return this.prisma.user.create({
      data: {
        ...data,
        password: await hash(data.password, 10),
        roles: [Role.USER],
      },
    });
  }
}
