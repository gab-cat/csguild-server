import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  UnauthorizedException,
  Patch,
} from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Role, User } from '../../generated/prisma';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateUserResponseDto,
  UserResponseDto,
} from './dto/user-response.dto';
import {
  SendEmailVerificationDto,
  VerifyEmailDto,
  EmailVerificationResponseDto,
} from './dto/email-verification.dto';
import {
  RegisterRfidDto,
  RfidLoginDto,
  RfidRegistrationResponseDto,
  RfidLoginResponseDto,
} from './dto/rfid-registration.dto';
import { LoggerService } from '../common/logger/logger.service';
import { Roles } from 'src/auth/roles/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateUserRequest } from './dto/update-user.request';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Register a new student account',
    description: `
      Creates a new student account for CSGUILD with comprehensive profile information.
      
      ## How it works:
      1. Validates all student information including unique email and username
      2. Hashes password using bcryptjs for security
      3. Generates email verification code
      4. Stores student in PostgreSQL database
      5. Sends verification email with 6-digit code
      6. Returns success response with verification instructions
      
      ## Student Information Required:
      - Email address (must be unique)
      - Username (must be unique, 3-30 characters, alphanumeric and underscores only)
      - Strong password (minimum 8 characters with mixed case, numbers, and special characters)
      - First and last name
      - Optional: birthdate, course, RFID card ID
      
      ## Post-Registration:
      - Student must verify email before accessing all features
      - RFID can be registered during signup or later
      - Default role: STUDENT
    `,
  })
  @ApiBody({ type: CreateUserRequest })
  @ApiResponse({
    status: 201,
    description: 'Student registration successful, verification email sent',
    type: CreateUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data or weak password',
  })
  @ApiConflictResponse({
    description: 'Email, username, or RFID card already exists',
  })
  async createUser(@Body() request: CreateUserRequest) {
    await this.usersService.create(request);
    return {
      message:
        'Student registration successful. Please check your email for verification instructions.',
      statusCode: 201,
      details: 'A verification email has been sent to your email address.',
    };
  }

  @Post('verify-email')
  @ApiOperation({
    summary: 'Verify student email address',
    description: `
      Verifies a student's email address using the 6-digit code sent via email.
      
      ## How it works:
      1. Validates the provided email and verification code
      2. Marks email as verified in the database
      3. Sends welcome email with login instructions
      4. Enables full access to CSGUILD features
      
      ## After Verification:
      - Student can access all CSGUILD features
      - RFID login becomes available (if RFID is registered)
      - Welcome email is sent with account details
    `,
  })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: EmailVerificationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid verification code or email already verified',
  })
  async verifyEmail(@Body() request: VerifyEmailDto) {
    await this.usersService.verifyEmail(
      request.email,
      request.verificationCode,
    );
    return {
      message: 'Email verified successfully',
      statusCode: 200,
      details: 'Welcome to CSGUILD! You can now access all features.',
    };
  }

  @Post('resend-verification')
  @ApiOperation({
    summary: 'Resend email verification code',
    description: `
      Resends the email verification code to a student's email address.
      
      ## How it works:
      1. Checks if email exists and is not already verified
      2. Generates new 6-digit verification code
      3. Updates code in database
      4. Sends new verification email
      
      ## Use Cases:
      - Original verification email was not received
      - Verification code expired
      - Student accidentally deleted the email
    `,
  })
  @ApiBody({ type: SendEmailVerificationDto })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
    type: EmailVerificationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Email not found or already verified',
  })
  async resendVerification(@Body() request: SendEmailVerificationDto) {
    await this.usersService.sendEmailVerification(request.email);
    return {
      message: 'Email verification code sent successfully',
      statusCode: 200,
      details: 'Please check your email for the new verification code.',
    };
  }

  @Post('register-rfid')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Register RFID card for student',
    description: `
      Registers an RFID card for quick access and attendance tracking.
      
      ## How it works:
      1. Validates that RFID card is not already registered
      2. Associates RFID card with current student account
      3. Sends confirmation email with RFID details
      4. Enables RFID-based login and attendance
      
      ## RFID Features:
      - Quick login without username/password
      - Automatic attendance tracking at events
      - Access control for CSGUILD facilities
      - Integration with lab equipment
      
      ## Requirements:
      - Student must be logged in
      - Email must be verified
      - RFID card must be unique
    `,
  })
  @ApiCookieAuth('Authentication')
  @ApiBody({ type: RegisterRfidDto })
  @ApiResponse({
    status: 201,
    description: 'RFID card registered successfully',
    type: RfidRegistrationResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiConflictResponse({
    description: 'RFID card already registered or user already has RFID',
  })
  async registerRfid(
    @Body() request: RegisterRfidDto,
    @CurrentUser() user: User,
  ) {
    await this.usersService.registerRfid(request.rfidId, user.email);
    return {
      message: 'RFID card registered successfully',
      statusCode: 201,
      details: 'You can now use your RFID card to access CSGUILD services.',
    };
  }

  @Post('rfid-login')
  @ApiOperation({
    summary: 'Login using RFID card',
    description: `
      Authenticate a student using their registered RFID card.
      
      ## How it works:
      1. Validates RFID card is registered in the system
      2. Checks that associated email is verified
      3. Returns student information for frontend processing
      4. Can be used to trigger attendance tracking
      
      ## Use Cases:
      - Quick login at CSGUILD terminals
      - Attendance tracking at events
      - Access control for facilities
      - Integration with lab equipment
      
      ## Security:
      - Requires email verification
      - RFID must be registered to valid student
      - Returns minimal student information
    `,
  })
  @ApiBody({ type: RfidLoginDto })
  @ApiResponse({
    status: 200,
    description: 'RFID login successful',
    type: RfidLoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'RFID card not registered or email not verified',
  })
  async rfidLogin(@Body() request: RfidLoginDto) {
    const user = await this.usersService.loginWithRfid(request.rfidId);
    return {
      message: 'RFID login successful',
      statusCode: 200,
      student: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get all students (protected)',
    description: `
      Retrieves all student accounts from the database.
      
      ## Authentication required:
      This endpoint requires a valid JWT access token in cookies and STAFF or ADMIN role.
      
      ## How it works:
      1. Validates JWT token using JwtAuthGuard (JwtStrategy)
      2. Checks user has STAFF or ADMIN role
      3. Returns all students with comprehensive information
      4. Excludes sensitive data like passwords and verification codes
      
      ## Required cookies:
      - \`Authentication\`: Valid JWT access token
      
      ## Required roles:
      - STAFF or ADMIN
    `,
  })
  @ApiCookieAuth('Authentication')
  @ApiResponse({
    status: 200,
    description: 'List of all students',
    type: [UserResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token, or insufficient permissions',
  })
  async getUsers(@CurrentUser() user: User): Promise<UserResponseDto[]> {
    this.logger.info('Getting all students:', user, 'UsersController');
    const users = await this.usersService.getUsers();
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      birthdate: u.birthdate,
      course: u.course,
      imageUrl: u.imageUrl,
      emailVerified: u.emailVerified,
      hasRefreshToken: !!u.refreshToken,
      hasRfidCard: !!u.rfidId,
      rfidId: u.rfidId,
      roles: u.roles,
      signupMethod: u.signupMethod as any,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get student by ID',
    description: `
      Retrieves a specific student's information by their ID.
      
      ## Authentication required:
      This endpoint requires a valid JWT access token in cookies.
      
      ## Access Control:
      - Students can only access their own information
      - STAFF and ADMIN can access any student's information
    `,
  })
  @ApiCookieAuth('Authentication')
  @ApiParam({
    name: 'id',
    description: 'Student ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  @ApiResponse({
    status: 200,
    description: 'Student information',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token',
  })
  async getUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    // Students can only access their own information, staff/admin can access any
    const hasStaffOrAdminRole =
      currentUser.roles.includes(Role.STAFF) ||
      currentUser.roles.includes(Role.ADMIN);
    if (currentUser.id !== id && !hasStaffOrAdminRole) {
      throw new UnauthorizedException(
        'You can only access your own information',
      );
    }

    const user = await this.usersService.getUser({ id });
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      birthdate: user.birthdate,
      course: user.course,
      imageUrl: user.imageUrl,
      emailVerified: user.emailVerified,
      hasRefreshToken: !!user.refreshToken,
      hasRfidCard: !!user.rfidId,
      rfidId: user.rfidId,
      roles: user.roles,
      signupMethod: user.signupMethod as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates a user',
  })
  @ApiBody({ type: UpdateUserRequest })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token',
  })
  async updateUser(
    @Body() request: UpdateUserRequest,
    @CurrentUser() user: User,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.updateUserProfile(
      { id: user.id },
      request,
    );
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      birthdate: updatedUser.birthdate,
      course: updatedUser.course,
      imageUrl: updatedUser.imageUrl,
      emailVerified: updatedUser.emailVerified,
      hasRefreshToken: !!updatedUser.refreshToken,
      hasRfidCard: !!updatedUser.rfidId,
      rfidId: updatedUser.rfidId,
      roles: updatedUser.roles,
      signupMethod: updatedUser.signupMethod as any,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
