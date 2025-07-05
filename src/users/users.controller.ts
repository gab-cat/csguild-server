import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Role, User } from 'generated/prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import {
  CreateUserResponseDto,
  UserResponseDto,
} from './dto/user-response.dto';
import { LoggerService } from '../common/logger/logger.service';
import { Roles } from 'src/auth/roles/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user account',
    description: `
      Creates a new user account with email and password.
      
      ## How it works:
      1. Validates email format and password strength
      2. Hashes password using bcryptjs
      3. Stores user in PostgreSQL database
      4. Returns success response
      
      ## Password requirements:
      - Minimum 8 characters
      - At least one lowercase letter
      - At least one uppercase letter
      - At least one digit
      - At least one special character (@$!%*?&)
    `,
  })
  @ApiBody({ type: CreateUserRequest })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: CreateUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data or weak password',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  async createUser(@Body() request: CreateUserRequest) {
    await this.usersService.create(request);
    return { message: 'User created successfully', statusCode: 201 };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get all users (protected)',
    description: `
      Retrieves all user accounts from the database.
      
      ## Authentication required:
      This endpoint requires a valid JWT access token in cookies.
      
      ## How it works:
      1. Validates JWT token using JwtAuthGuard (JwtStrategy)
      2. Extracts current user from token
      3. Returns all users (excluding passwords)
      
      ## Required cookies:
      - \`Authentication\`: Valid JWT access token
    `,
  })
  @ApiCookieAuth('Authentication')
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token',
  })
  async getUsers(@CurrentUser() user: User): Promise<UserResponseDto[]> {
    this.logger.info('Current user:', user, 'UsersController');
    const users = await this.usersService.getUsers();
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      hasRefreshToken: !!u.refreshToken,
    }));
  }
}
