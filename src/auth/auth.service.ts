import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { Response } from 'express';
import { TokenPayload } from './token-payload.interface';
import { User } from 'generated/prisma/client';
import { EmailService } from '../common/email/email.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async login(user: User, response: Response, redirect = false) {
    // Check if email is verified for regular login
    if (!user.emailVerified) {
      throw new ConflictException(
        'UNVERIFIED EMAIL: Please verify your email address before logging in.',
      );
    }

    const expiresAccessToken = new Date();
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setMilliseconds(
      expiresRefreshToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
      roles: user.roles,
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_ACCESS_TOKEN_EXPIRATION_MS',
      )}ms`,
    });
    const refreshToken = this.jwtService.sign(
      { userId: tokenPayload.userId },
      {
        secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: `${this.configService.getOrThrow(
          'JWT_REFRESH_TOKEN_EXPIRATION_MS',
        )}ms`,
      },
    );

    await this.usersService.updateUser(
      { id: user.id },
      { refreshToken: await hash(refreshToken, 10) },
    );

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });

    if (redirect) {
      response.redirect(this.configService.getOrThrow('AUTH_UI_REDIRECT'));
    }
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({
        email,
      });
      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  async verifyUserRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.getUser({ id: userId });
      const authenticated = await compare(
        refreshToken,
        user.refreshToken || '',
      );
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }

  async loginWithRfid(rfidId: string, response: Response) {
    try {
      const user = await this.usersService.loginWithRfid(rfidId);

      // Create session for RFID login (same as regular login but skip email verification check)
      const expiresAccessToken = new Date();
      expiresAccessToken.setMilliseconds(
        expiresAccessToken.getTime() +
          parseInt(
            this.configService.getOrThrow<string>(
              'JWT_ACCESS_TOKEN_EXPIRATION_MS',
            ),
          ),
      );

      const expiresRefreshToken = new Date();
      expiresRefreshToken.setMilliseconds(
        expiresRefreshToken.getTime() +
          parseInt(
            this.configService.getOrThrow<string>(
              'JWT_REFRESH_TOKEN_EXPIRATION_MS',
            ),
          ),
      );

      const tokenPayload: TokenPayload = {
        userId: user.id,
        roles: user.roles,
      };
      const accessToken = this.jwtService.sign(tokenPayload, {
        secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: `${this.configService.getOrThrow(
          'JWT_ACCESS_TOKEN_EXPIRATION_MS',
        )}ms`,
      });
      const refreshToken = this.jwtService.sign(
        { userId: tokenPayload.userId },
        {
          secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: `${this.configService.getOrThrow(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
          )}ms`,
        },
      );

      await this.usersService.updateUser(
        { id: user.id },
        { refreshToken: await hash(refreshToken, 10) },
      );

      response.cookie('Authentication', accessToken, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        expires: expiresAccessToken,
      });
      response.cookie('Refresh', refreshToken, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        expires: expiresRefreshToken,
      });

      return user;
    } catch (err) {
      throw new UnauthorizedException(
        'RFID authentication failed. Please ensure your RFID card is registered and your email is verified.',
      );
    }
  }

  async logout(response: Response, user: User) {
    void this.usersService.updateUser({ id: user.id }, { refreshToken: null });
    response.cookie('Authentication', '', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: new Date(),
    });
    response.cookie('Refresh', '', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: new Date(),
    });
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      // Check if user exists with this email
      const user = await this.usersService.getUser({ email });

      // Generate secure random token
      const resetToken = randomBytes(32).toString('hex');

      // Hash the token before storing it
      const hashedToken = await hash(resetToken, 10);

      // Set expiration time (1 hour from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Store hashed token and expiration in database
      await this.usersService.updateUser(
        { id: user.id },
        {
          passwordResetToken: hashedToken,
          passwordResetExpiresAt: expiresAt,
        },
      );

      // Send email with unhashed token as URL parameter
      await this.emailService.sendPasswordReset({
        email: user.email,
        firstName: user.firstName || 'User',
        resetToken: resetToken,
      });
    } catch (error) {
      // For security reasons, we don't reveal whether the email exists or not
      // We silently succeed even if the user doesn't exist
      console.log('Password reset requested for non-existent email:', email);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Find user with a valid (non-expired) reset token
      const users = await this.usersService.getUsers();
      let targetUser: User | null = null;

      // Check each user's hashed token against the provided token
      for (const user of users) {
        if (
          user.passwordResetToken &&
          user.passwordResetExpiresAt &&
          user.passwordResetExpiresAt > new Date()
        ) {
          const isValidToken = await compare(token, user.passwordResetToken);
          if (isValidToken) {
            targetUser = user;
            break;
          }
        }
      }

      if (!targetUser) {
        throw new BadRequestException(
          'Invalid or expired password reset token.',
        );
      }

      // Hash the new password
      const hashedPassword = await hash(newPassword, 10);

      // Update user's password and clear reset token
      await this.usersService.updateUser(
        { id: targetUser.id },
        {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiresAt: null,
          // Also clear refresh token to force re-login
          refreshToken: null,
        },
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to reset password. Please try again.',
      );
    }
  }
}
