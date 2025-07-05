import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';
import { RATE_LIMITING } from '../../constants';

@Injectable()
export class FailedLoginThrottleGuard extends ThrottlerGuard {
  private failedAttempts = new Map<
    string,
    { count: number; firstAttempt: number }
  >();
  private readonly maxAttempts = RATE_LIMITING.FAILED_LOGIN.MAX_ATTEMPTS;
  private readonly windowMs = RATE_LIMITING.FAILED_LOGIN.WINDOW_MS;
  private readonly blockDurationMs =
    RATE_LIMITING.FAILED_LOGIN.BLOCK_DURATION_MS;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIP(request);

    // Check if IP is currently blocked
    if (this.isBlocked(ip)) {
      throw new ThrottlerException(
        'Too many failed login attempts. Please try again later.',
      );
    }

    return true;
  }

  /**
   * Record a failed login attempt for the given IP
   */
  recordFailedAttempt(ip: string): void {
    const now = Date.now();
    const attempts = this.failedAttempts.get(ip);

    if (!attempts) {
      this.failedAttempts.set(ip, { count: 1, firstAttempt: now });
    } else {
      // Reset if window has expired
      if (now - attempts.firstAttempt > this.windowMs) {
        this.failedAttempts.set(ip, { count: 1, firstAttempt: now });
      } else {
        attempts.count++;
      }
    }

    // Clean up old entries periodically
    this.cleanupOldEntries();
  }

  /**
   * Clear failed attempts for successful login
   */
  clearFailedAttempts(ip: string): void {
    this.failedAttempts.delete(ip);
  }

  /**
   * Check if IP is currently blocked due to too many failed attempts
   */
  private isBlocked(ip: string): boolean {
    const attempts = this.failedAttempts.get(ip);
    if (!attempts) return false;

    const now = Date.now();

    // If window expired, remove the entry
    if (now - attempts.firstAttempt > this.windowMs) {
      this.failedAttempts.delete(ip);
      return false;
    }

    return attempts.count >= this.maxAttempts;
  }

  /**
   * Get remaining time until block expires
   */
  getBlockTimeRemaining(ip: string): number {
    const attempts = this.failedAttempts.get(ip);
    if (!attempts) return 0;

    const now = Date.now();
    const blockEndTime = attempts.firstAttempt + this.blockDurationMs;
    return Math.max(0, blockEndTime - now);
  }

  /**
   * Get failed attempt count for IP
   */
  getFailedAttemptCount(ip: string): number {
    const attempts = this.failedAttempts.get(ip);
    return attempts?.count || 0;
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

  /**
   * Clean up old entries to prevent memory leaks
   */
  private cleanupOldEntries(): void {
    const now = Date.now();
    for (const [ip, attempts] of this.failedAttempts.entries()) {
      if (now - attempts.firstAttempt > this.windowMs) {
        this.failedAttempts.delete(ip);
      }
    }
  }
}
