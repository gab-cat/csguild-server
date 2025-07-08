import { Controller, Get, Post, Res, UseGuards, Body } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FailedLoginThrottleGuard } from './guards/failed-login-throttle.guard';
import { User } from '../../generated/prisma';
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
  AuthMeResponseDto,
} from './dto/auth-response.dto';
import { RfidLoginDto } from '../users/dto/rfid-registration.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SignupMethod } from 'src/users/dto/create-user.request';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(FailedLoginThrottleGuard, LocalAuthGuard)
  @ApiOperation({
    summary: 'Login with email and password',
    description: `
      Authenticates student with email and password credentials.
      
      ## How it works:
      1. Checks for rate limiting (max 5 failed attempts per 15 minutes per IP)
      2. Validates credentials using LocalAuthGuard (LocalStrategy)
      3. Verifies that email is verified
      4. Generates JWT access and refresh tokens
      5. Sets HTTP-only cookies with tokens
      6. Returns success response
      
      ## Email Verification Required:
      Students must verify their email address before being able to log in.
      If email is not verified, the login will fail with instructions to verify.
      
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
    description: 'Invalid credentials or email not verified',
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

  @Post('rfid-login')
  @ApiOperation({
    summary: 'Login using RFID card',
    description: `
      Authenticates a student using their registered RFID card and creates a session.
      
      ## How it works:
      1. Validates RFID card is registered in the system
      2. Checks that associated email is verified
      3. Creates JWT access and refresh tokens
      4. Sets HTTP-only cookies with tokens
      5. Returns student information and success response
      
      ## RFID Login Features:
      - No username/password required
      - Quick authentication for terminals
      - Automatic session creation
      - Same security as regular login
      
      ## Requirements:
      - RFID card must be registered
      - Associated email must be verified
      - Valid RFID card format
      
      ## Use Cases:
      - Quick login at CSGUILD terminals
      - Attendance tracking at events
      - Access control for facilities
      - Lab equipment authentication
    `,
  })
  @ApiBody({ type: RfidLoginDto })
  @ApiResponse({
    status: 200,
    description: 'RFID login successful, session created',
    type: AuthSuccessResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'RFID card not registered or email not verified',
    type: AuthErrorResponseDto,
  })
  async rfidLogin(
    @Body() request: RfidLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.loginWithRfid(request.rfidId, response);
    return {
      message: 'RFID login successful',
      statusCode: 200,
      student: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        course: user.course,
        imageUrl: user.imageUrl,
      },
    };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({
    summary: 'Refresh access token',
    description: `
      Refreshes the JWT access token using a valid refresh token.
      
      ## How it works:
      1. Validates refresh token from \`Refresh\` cookie
      2. Uses JwtRefreshAuthGuard (JwtRefreshStrategy) to validate token
      3. Compares refresh token with hashed version in database
      4. Generates new access and refresh tokens
      5. Updates refresh token in database
      6. Sets new cookies with updated expiration times
      
      ## Required cookies:
      - \`Refresh\`: Valid JWT refresh token
      
      ## Security:
      - Refresh tokens are hashed in database
      - Old refresh token is invalidated
      - New tokens have updated expiration times
    `,
  })
  @ApiCookieAuth('Refresh')
  @ApiResponse({
    status: 201,
    description: 'Tokens refreshed successfully',
    type: AuthSuccessResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
    type: AuthErrorResponseDto,
  })
  async refresh(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
    return { message: 'Tokens refreshed successfully', statusCode: 201 };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Logout user',
    description: `
      Logs out the current user by invalidating tokens.
      
      ## How it works:
      1. Validates current user from JWT token
      2. Removes refresh token from database
      3. Clears authentication cookies
      4. Returns success response
      
      ## Security:
      - Refresh token is removed from database
      - Cookies are cleared with immediate expiration
      - Access token becomes invalid on next request
    `,
  })
  @ApiCookieAuth('Authentication')
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: AuthSuccessResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    type: AuthErrorResponseDto,
  })
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(response, user);
    return { message: 'Logout successful', statusCode: 200 };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Initiate Google OAuth login',
    description: `
      Initiates Google OAuth 2.0 authentication flow.
      
      ## How it works:
      1. Redirects user to Google OAuth consent screen
      2. User grants permission to access profile and email
      3. Google redirects back to callback URL with authorization code
      4. System exchanges code for user profile information
      
      ## OAuth Flow:
      1. User clicks "Login with Google"
      2. Redirected to this endpoint
      3. Redirected to Google OAuth consent screen
      4. User grants permission
      5. Google redirects to /auth/google/callback
      6. System creates or finds user account
      7. User is logged in automatically
      
      ## Auto-Registration:
      - If user doesn't exist, account is created automatically
      - Email is auto-verified for Google accounts
      - Username is generated from email if not provided
      - Default role: STUDENT
    `,
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth consent screen',
  })
  loginGoogle() {
    // Handled by GoogleAuthGuard
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
      4. Auto-verifies email for Google accounts
      5. Generates JWT tokens and sets cookies
      6. Redirects to configured frontend URL
      
      ## Auto-Account Creation:
      - Email and profile information from Google
      - Auto-generated username if not provided
      - Email is automatically verified
      - Default STUDENT role assigned
      
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user',
  })
  async me(@CurrentUser() user: User): Promise<AuthMeResponseDto> {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      rfidId: user.rfidId,
      imageUrl: user.imageUrl,
      course: user.course,
      currentFacilityId: user.currentFacilityId,
      username: user.username,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      signupMethod: user.signupMethod as SignupMethod,
    };
  }
}
