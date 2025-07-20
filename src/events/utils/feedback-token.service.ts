import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface FeedbackTokenPayload {
  eventId: string;
  userId: string;
  formId: string;
  expiresAt: number;
}

@Injectable()
export class FeedbackTokenService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate a secure token for feedback form access
   */
  generateFeedbackToken(
    payload: Omit<FeedbackTokenPayload, 'expiresAt'>,
  ): string {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days from now

    const tokenPayload: FeedbackTokenPayload = {
      ...payload,
      expiresAt,
    };

    const secret = this.configService.get('JWT_SECRET', 'default-secret');
    return jwt.sign(tokenPayload, secret);
  }

  /**
   * Verify and decode a feedback token
   */
  verifyFeedbackToken(token: string): FeedbackTokenPayload {
    const secret = this.configService.get('JWT_SECRET', 'default-secret');
    return jwt.verify(token, secret) as FeedbackTokenPayload;
  }

  /**
   * Generate a unique feedback URL for an attendee
   */
  generateFeedbackUrl(
    eventId: string,
    userId: string,
    formId: string,
    slug: string,
  ): string {
    const token = this.generateFeedbackToken({ eventId, userId, formId });
    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    return `${frontendUrl}/events/${slug}/feedback/public?token=${token}&userId=${userId}`;
  }

  /**
   * Generate a combined feedback and rating URL for an attendee
   * This URL can be used for both feedback submission and organizer rating
   */
  generateFeedbackAndRatingUrl(
    eventId: string,
    userId: string,
    formId: string,
    slug: string,
  ): string {
    const token = this.generateFeedbackToken({ eventId, userId, formId });
    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    return `${frontendUrl}/events/${slug}/feedback-and-rating?token=${token}&userId=${userId}`;
  }
}
