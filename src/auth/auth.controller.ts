import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FailedLoginThrottleGuard } from './guards/failed-login-throttle.guard';
import { User } from 'generated/prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import {
  AuthSuccessResponseDto,
  AuthErrorResponseDto,
} from './dto/auth-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly failedLoginThrottleGuard: FailedLoginThrottleGuard,
  ) {}

  @Post('login')
  @UseGuards(FailedLoginThrottleGuard, LocalAuthGuard)
  @ApiOperation({
    summary: 'Login with email and password',
    description: `
      Authenticates user with email and password credentials.
      
      ## How it works:
      1. Checks for rate limiting (max 5 failed attempts per 15 minutes per IP)
      2. Validates credentials using LocalAuthGuard (LocalStrategy)
      3. Generates JWT access and refresh tokens
      4. Sets HTTP-only cookies with tokens
      5. Returns success response
      
      ## Rate Limiting:
      - Maximum 5 failed login attempts per IP address within 15 minutes
      - After 5 failed attempts, IP is temporarily blocked for 15 minutes
      - Successful login clears the failed attempt counter
      - Error messages include remaining attempts and lockout duration
      
      ## Cookies set:
      - \`Authentication\`: JWT access token (1 hour expiry)
      - \`Refresh\`: JWT refresh token (24 hours expiry)
    `,
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login successful, cookies set',
    type: AuthSuccessResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: AuthErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data',
  })
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
    return { message: 'Login successful', statusCode: 201 };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({
    summary: 'Refresh access token',
    description: `
      Refreshes the access token using the refresh token from cookies.
      
      ## How it works:
      1. Validates refresh token using JwtRefreshAuthGuard (JwtRefreshStrategy)
      2. Generates new JWT access and refresh tokens
      3. Updates HTTP-only cookies with new tokens
      4. Returns success response
      
      ## Required cookies:
      - \`Refresh\`: Valid JWT refresh token
    `,
  })
  @ApiCookieAuth('Refresh')
  @ApiResponse({
    status: 201,
    description: 'Token refreshed successfully, new cookies set',
    type: AuthSuccessResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
    type: AuthErrorResponseDto,
  })
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
    return { message: 'Token refreshed successfully', statusCode: 201 };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Initiate Google OAuth login',
    description: `
      Initiates Google OAuth 2.0 authentication flow.
      
      ## How it works:
      1. Redirects user to Google OAuth consent screen
      2. User grants permissions
      3. Google redirects to /auth/google/callback
      
      ## Required configuration:
      - GOOGLE_CLIENT_ID environment variable
      - GOOGLE_CLIENT_SECRET environment variable
    `,
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth consent screen',
  })
  loginGoogle() {
    // Guard handles the redirect to Google OAuth
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: `
      Handles the callback from Google OAuth flow.
      
      ## How it works:
      1. Receives authorization code from Google
      2. Exchanges code for user profile information
      3. Creates or finds existing user account
      4. Generates JWT tokens and sets cookies
      5. Redirects to configured frontend URL
      
      ## Environment variables used:
      - AUTH_UI_REDIRECT: Frontend URL to redirect after success
    `,
  })
  @ApiResponse({
    status: 302,
    description:
      'Redirects to configured frontend URL with authentication cookies set',
  })
  @ApiUnauthorizedResponse({
    description: 'Google OAuth failed or cancelled',
    type: AuthErrorResponseDto,
  })
  async googleCallback(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response, true);
  }
}
