import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { FailedLoginThrottleGuard } from '../guards/failed-login-throttle.guard';
import { Request } from 'express';
import { RATE_LIMITING } from '../../constants';
import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly failedLoginThrottleGuard: FailedLoginThrottleGuard,
    private readonly logger: LoggerService,
  ) {
    super({
      usernameField: 'email',
      passReqToCallback: true, // This allows us to access the request object
    });
  }

  async validate(request: Request, email: string, password: string) {
    const ip = this.getClientIP(request);

    try {
      const user = await this.authService.verifyUser(email, password);

      // Clear failed attempts on successful login
      this.failedLoginThrottleGuard.clearFailedAttempts(ip);

      return user;
    } catch (error) {
      // Record failed login attempt
      this.failedLoginThrottleGuard.recordFailedAttempt(ip);

      const failedCount =
        this.failedLoginThrottleGuard.getFailedAttemptCount(ip);
      const maxAttempts = RATE_LIMITING.FAILED_LOGIN.MAX_ATTEMPTS;

      if (failedCount >= maxAttempts) {
        const blockTimeMs =
          this.failedLoginThrottleGuard.getBlockTimeRemaining(ip);
        const blockTimeMinutes = Math.ceil(blockTimeMs / (1000 * 60));

        this.logger.warn(
          `Too many failed login attempts. Account temporarily locked for ${blockTimeMinutes} minutes.`,
          {
            ip,
            email,
            failedCount,
            maxAttempts,
            blockTimeMinutes,
          },
        );

        throw new UnauthorizedException(
          `Too many failed login attempts. Account temporarily locked for ${blockTimeMinutes} minutes.`,
        );
      }

      throw new UnauthorizedException(
        `Invalid credentials. ${maxAttempts - failedCount} attempts remaining before temporary lockout.`,
      );
    }
  }

  /**
   * Extract client IP from request
   */
  private getClientIP(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string) ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      '127.0.0.1'
    )
      .split(',')[0]
      .trim();
  }
}
