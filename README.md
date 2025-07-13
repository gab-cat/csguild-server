# CSGUILD Backend - Computer Science Guild Management System

A comprehensive NestJS backend system for the Computer Science Guild featuring:

- **PostgreSQL** database with **Prisma** ORM
- JWT Authentication (Access & Refresh tokens)
- **Student Registration** with enhanced fields
- **Email Verification** system with SMTP
- **RFID Authentication** for student access
- Google OAuth2 integration
- **Email Service** with HTML templates
- **Project Management** with CQRS pattern
- **Facility Management** with occupancy tracking
- Cookie-based token storage
- TypeScript support
- Docker setup for development
- **C### 6. Facility Management Test### 4. Project Management Testing

1. Create projects via `POST /projects`
2. Test project filtering and search via `GET /projects`
3. Apply to projects via `POST /projects/join`
4. Review applications via `POST /projects/applications/review`
5. Test project updates and status changes with enhanced role handling
6. Check team member management and role consistency
7. Test CQRS command and query separation
8. Verify modular architecture benefits (consistent data handling, proper error isolation)reate facilities via `POST /facilities`
2. Test RFID time-in/time-out via `POST /facilities/toggle`
3. Monitor real-time occupancy via `GET /facilities`
4. Check facility usage history and analytics
5. Test capacity management and overflow handling

### 7. Real-time Monitoringwagger/OpenAPI documentation**

## Features

- 🎓 **Student Registration** with comprehensive fields (username, firstName, lastName, birthdate, course)
- 📧 **Email Verification** system with 6-digit codes
- 🔐 **RFID Authentication** for student access cards
- 🔑 JWT Authentication with refresh tokens
- 🚀 Google OAuth2 integration with auto-registration
- 📬 **Email Service** with HTML templates (verification, welcome, password reset)
- 🏢 **Facility Management** with capacity tracking and occupancy monitoring
- 📋 **Project Management** with team collaboration using CQRS pattern
- 👥 **Role Management** with CQRS pattern for user role administration
- ⏰ **Automated User Timeout** system with daily cron jobs
- 📊 **Real-time Log Viewer** with WebSocket support and authentication
- 🐘 PostgreSQL with Prisma ORM
- 🍪 HTTP-only cookie authentication
- 🛡️ Guards for route protection
- 🔄 Automatic token refresh
- 🐳 Docker development environment
- 📝 TypeScript throughout
- 📚 **Complete API documentation with Swagger**
- 🧪 Comprehensive guard and strategy documentation

## Prerequisites

- Node.js (v18+ recommended)
- Bun (package manager)
- Docker (for database)
- PostgreSQL (if not using Docker)
- SMTP server for email functionality

## Installation

1. **Install dependencies:**

```bash
bun install
```

2. **Start the PostgreSQL database:**

```bash
docker-compose up -d
```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/csguild?schema=public"

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET="your-super-secret-access-token-key"
JWT_REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key"
JWT_ACCESS_TOKEN_EXPIRATION_MS="3600000"
JWT_REFRESH_TOKEN_EXPIRATION_MS="86400000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Auth UI Redirect
AUTH_UI_REDIRECT="http://localhost:3000/dashboard"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@csguild.com"
FROM_NAME="CSGUILD"

# Logging Configuration
LOG_FORMAT="false"              # Set to "json" for JSON formatting
LOG_LEVEL="info"                # Log level: error, warn, info, debug
LOG_COLORS="true"               # Enable/disable colored output
SERVICE_NAME="csguild-server"   # Service name for logs

# Environment
NODE_ENV="development"
```

4. **Generate Prisma client and run migrations:**

```bash
bun run db:generate
bun run db:migrate
```

## Running the Application

```bash
# Development mode
bun run dev

# Production mode
bun run start:prod

# Debug mode
bun run start:debug
```

The application will be available at `http://localhost:3000`

## 📊 Real-time Log Viewer

Access the comprehensive log viewer at:

**🔗 [http://localhost:3000/logs](http://localhost:3000/logs)**

### Log Viewer Features

- **Real-time WebSocket connection** for live log streaming
- **Dual-panel interface**: Service logs and HTTP route logs
- **Authentication required**: Login with your student/staff credentials
- **Auto-scroll functionality** with toggle controls
- **Connection status indicators** for both log streams
- **Log filtering and categorization**
- **Dark theme** optimized for development

### Log Categories

- **Service Logs**: Application events, authentication, facility operations, cron jobs
- **Route Logs**: HTTP requests, responses, API endpoint access

### Authentication

The log viewer requires authentication to protect sensitive system information:
- Use your student email/username and password
- Same credentials as the main application
- Session maintained for the duration of your browser session

## ⏰ Automated Cron Jobs

The system includes automated background tasks for facility and user management:

### Daily User Timeout (8 PM)

- **Schedule**: Every day at 8:00 PM local time
- **Function**: Automatically times out all active users from facilities
- **Purpose**: Ensures facilities are properly closed at end of business day
- **Logging**: Full execution details logged for audit trail

### Implementation

The cron service runs automatically when the application starts:

```typescript
@Cron('0 20 * * *') // 8 PM daily
async timeoutUsersDaily() {
  const result = await this.usersService.timeoutAllActiveUsers();
  // Logs: "CRON timeout executed: X users timed out"
}
```

### Monitoring Cron Jobs

- View cron execution logs in the real-time log viewer
- Check console output for cron service initialization
- Monitor daily timeout operations in service logs
- All cron activities are logged with timestamps and results

## 📚 API Documentation

### Swagger UI

Once the application is running, access the interactive API documentation at:

**🔗 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

The Swagger UI provides:

- Interactive API testing
- Complete endpoint documentation
- Request/response schemas
- Authentication examples
- Guard and strategy explanations

### Documentation Features

- **Complete API Coverage**: All endpoints documented with examples
- **Authentication Guide**: Step-by-step auth flow documentation
- **Student Registration**: Complete student onboarding flow
- **Email Verification**: Email verification workflow
- **RFID Integration**: RFID card registration and authentication
- **Error Responses**: Detailed error codes and messages
- **Cookie Authentication**: HTTP-only cookie setup explained
- **OAuth Flow**: Google OAuth integration walkthrough
- **Guard Documentation**: When and how to use each guard
- **Strategy Details**: Authentication strategy implementations

### Quick API Reference

#### Authentication Endpoints

- `POST /auth/login` - Login with email/password (requires email verification)
- `POST /auth/rfid-login` - Login with RFID card
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and clear tokens
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback

#### Student Endpoints

- `POST /users` - Register new student
- `GET /users` - Get all students (protected)
- `GET /users/:id` - Get individual student (protected)
- `POST /users/verify-email` - Verify email with 6-digit code
- `POST /users/resend-verification` - Resend email verification code
- `POST /users/register-rfid` - Register RFID card (authenticated)
- `POST /users/rfid-login` - Login using RFID card

#### Project Endpoints

- `POST /projects` - Create new project (authenticated)
- `GET /projects` - Get all projects with filtering and pagination (authenticated)
- `GET /projects/my-projects` - Get current user's projects (authenticated)
- `GET /projects/my-applications` - Get current user's applications (authenticated)
- `GET /projects/:id` - Get project details (authenticated)
- `PATCH /projects/:id` - Update project (project owner only)
- `PATCH /projects/:id/status` - Update project status (project owner only)
- `DELETE /projects/:id` - Delete project (project owner only)
- `POST /projects/join` - Apply to join project (authenticated)
- `POST /projects/applications/review` - Review application (project owner only)

#### Role Endpoints

- `GET /roles` - Get all roles with filtering and pagination (public)
- `GET /roles/:identifier` - Get role by ID or slug (public)
- `POST /roles` - Create new role (staff/admin only)
- `PATCH /roles/:id` - Update role (staff/admin only)
- `DELETE /roles/:id` - Delete role (staff/admin only)

## 🎓 Student Registration System

### Registration Flow

1. **Student Registration**: `POST /users` with complete student information
2. **Email Verification**: System sends 6-digit verification code
3. **Verify Email**: `POST /users/verify-email` with verification code
4. **Login**: `POST /auth/login` with verified account
5. **RFID Registration**: `POST /users/register-rfid` to link RFID card

### Student Fields

- `email` - Student's email address (unique)
- `username` - Unique username (auto-generated if not provided)
- `password` - Secure password (hashed)
- `firstName` - Student's first name
- `lastName` - Student's last name
- `birthdate` - Date of birth
- `course` - Academic course/program
- `roles` - User roles (defaults to STUDENT)

### Email Verification

- 6-digit verification codes
- Automatic email sending with HTML templates
- Resend functionality
- Required for login authentication

### RFID Integration

- Link RFID cards to student accounts
- Quick authentication using RFID
- Secure card registration process
- RFID-based login system

## 📋 Project Management System (CQRS Pattern)

### Project Features

- **Create Projects**: Students can create collaborative projects with detailed descriptions
- **Role-Based Teams**: Define specific roles needed (Frontend Developer, Designer, etc.)
- **Application System**: Students apply to join projects with custom messages
- **Team Management**: Project owners review and approve/reject applications
- **Project Tracking**: Track project status from creation to completion
- **Advanced Filtering**: Search projects by status, tags, description, or owner

### Project Workflow

1. **Create Project**: `POST /projects` with title, description, tags, and required roles
2. **Browse Projects**: `GET /projects` with filtering options (status, tags, search)
3. **Apply to Project**: `POST /projects/join` with role preference and application message
4. **Review Applications**: Project owners use `POST /projects/applications/review`
5. **Team Collaboration**: Approved members become active team members
6. **Project Updates**: Owners can update project details and status

### Project Structure

- **Project Details**: Title, description, tags, due date, status
- **Role Definitions**: Specific roles with member limits and requirements
- **Team Members**: Active participants with assigned roles
- **Applications**: Pending/reviewed applications with status tracking
- **Owner Management**: Project creators have full control over their projects

### CQRS Implementation

The project module uses Command Query Responsibility Segregation (CQRS) pattern:

#### Commands (Write Operations)
- `CreateProjectCommand` - Create new projects
- `UpdateProjectCommand` - Modify project details with enhanced modular architecture
- `UpdateProjectStatusCommand` - Change project status
- `DeleteProjectCommand` - Remove projects
- `JoinProjectCommand` - Submit project applications
- `ReviewApplicationCommand` - Approve/reject applications

#### Queries (Read Operations)
- `FindAllProjectsQuery` - List projects with filtering
- `FindByIdQuery` - Get project details
- `GetMyProjectsQuery` - User's owned/member projects
- `GetMyApplicationsQuery` - User's submitted applications

### Enhanced Architecture Features

#### Modular Command Handlers
The `UpdateProjectHandler` has been refactored with improved separation of concerns:

- **Single Responsibility**: Each method handles one specific task
- **Improved Testability**: Individual methods can be unit tested independently
- **Better Maintainability**: Changes can be made to specific functionality without affecting others
- **Consistent Data Handling**: Standardized default value application for role properties

#### Method Decomposition
- `validateProjectOwnership()` - Project existence and authorization validation
- `performProjectUpdate()` - Transaction management and basic project updates
- `updateProjectRoles()` - Role validation and differential updates orchestration
- `getExistingProjectRoles()` - Optimized database queries for current roles
- `calculateRoleDifferences()` - Pure business logic for role comparison
- `executeRoleOperations()` - Parallel database operations execution
- `getUpdatedProjectDetails()` - Final project retrieval with validation
- `handleUpdateError()` - Centralized error handling and transformation

## 👥 Role Management System (CQRS Pattern)

### Role Features

- **Create Roles**: Staff and admin users can create new user roles with descriptions
- **Public Access**: Anyone can view and search roles without authentication
- **Automatic Slug Generation**: URL-friendly slugs generated from role names
- **Search & Filter**: Search roles by name, slug, or description with pagination
- **Smart Querying**: Find roles by ID or slug using the same endpoint
- **Usage Protection**: Prevent deletion of roles assigned to users or projects
- **Staff Control**: Only staff and admin users can create, update, or delete roles

### Role Workflow

1. **Create Role**: `POST /roles` with name and description (staff/admin only)
2. **Browse Roles**: `GET /roles` with search and pagination (public access)
3. **Get Role Details**: `GET /roles/:identifier` by ID or slug (public access)
4. **Update Role**: `PATCH /roles/:id` to modify details (staff/admin only)
5. **Delete Role**: `DELETE /roles/:id` if not in use (staff/admin only)

### Role Structure

- **Role Details**: Name, slug, description, timestamps
- **Automatic Slugs**: Generated from role names for URL-friendly access
- **Usage Tracking**: Connected to users and projects
- **Access Control**: Public read access, staff/admin write access

### CQRS Implementation

The role module uses Command Query Responsibility Segregation (CQRS) pattern:

#### Commands (Write Operations)
- `CreateRoleCommand` - Create new roles with automatic slug generation
- `UpdateRoleCommand` - Modify role details with conflict detection  
- `DeleteRoleCommand` - Remove roles with usage validation

#### Queries (Read Operations)
- `FindAllRolesQuery` - List roles with search and pagination
- `FindRoleByIdQuery` - Get role details by ID
- `FindRoleBySlugQuery` - Get role details by slug

## 📧 Email Service

The system includes a comprehensive email service with:

- **HTML Templates**: Professional email templates using Handlebars
- **SMTP Configuration**: Support for various email providers
- **Email Types**:
  - Email verification with 6-digit codes
  - Welcome emails for new students
  - Password reset with secure token-based links (1-hour expiration)
  - RFID registration confirmations

### Email Templates

- `email-verification.hbs` - Email verification codes
- `welcome.hbs` - Welcome new students
- `password-reset.hbs` - Password reset instructions
- `rfid-registration.hbs` - RFID card registration confirmation

## Database Management

The template includes helpful Prisma scripts:

```bash
# Generate Prisma client
bun run db:generate

# Run migrations
bun run db:migrate

# Push schema changes (for prototyping)
bun run db:push

# Open Prisma Studio (database GUI)
bun run db:studio

# Reset database
bun run db:reset

# Seed facilities (run manually when needed)
bun exec ts-node scripts/seed-facilities.ts
```

## 🛡️ Authentication System

### Guards Documentation

Detailed documentation for all authentication guards:

- **[Guards README](src/auth/guards/README.md)** - Complete guard documentation
- `LocalAuthGuard` - Email/password authentication
- `JwtAuthGuard` - JWT token validation
- `JwtRefreshAuthGuard` - Refresh token validation
- `GoogleAuthGuard` - Google OAuth flow

### Strategies Documentation

Comprehensive strategy implementation details:

- **[Strategies README](src/auth/strategies/README.md)** - Complete strategy documentation
- `LocalStrategy` - Credential validation
- `JwtStrategy` - Access token processing
- `JwtRefreshStrategy` - Refresh token handling
- `GoogleStrategy` - OAuth 2.0 flow with student auto-registration

### Authentication Flow

1. **Student Registration**: `POST /users` with complete student information
2. **Email Verification**: Verify email with 6-digit code
3. **Login**: `POST /auth/login` with verified credentials
4. **Access Protected Routes**: Automatic cookie-based auth
5. **Token Refresh**: `POST /auth/refresh` when token expires
6. **Password Reset**: `POST /auth/forgot-password` → email link → `POST /auth/reset-password`
7. **Google OAuth**: `GET /auth/google` for social login with auto-registration
8. **RFID Authentication**: `POST /auth/rfid-login` for card-based access

## Project Structure

```
src/
├── auth/
│   ├── dto/                # Request/response DTOs
│   ├── guards/             # Authentication guards
│   │   └── README.md       # 📚 Guards documentation
│   ├── strategies/         # Passport strategies
│   │   └── README.md       # 📚 Strategies documentation
│   ├── auth.controller.ts  # Auth endpoints
│   ├── auth.service.ts     # Auth business logic
│   └── auth.module.ts      # Auth module
├── users/
│   ├── dto/               # User DTOs
│   │   ├── create-user.request.ts
│   │   ├── user-response.dto.ts
│   │   ├── email-verification.dto.ts
│   │   └── rfid-registration.dto.ts
│   ├── models/            # User interfaces
│   ├── users.controller.ts # Student endpoints
│   ├── users.service.ts   # Student business logic
│   └── users.module.ts    # Users module
├── projects/
│   ├── commands/          # CQRS Command handlers
│   │   ├── create-project/
│   │   ├── update-project/ # Enhanced with modular architecture & consistent data handling
│   │   ├── delete-project/
│   │   ├── join-project/
│   │   └── review-application/
│   ├── queries/           # CQRS Query handlers
│   │   ├── find-all-projects/
│   │   ├── find-by-id/
│   │   ├── get-my-projects/
│   │   └── get-my-applications/
│   ├── dto/               # Project DTOs
│   ├── types/             # Project type definitions
│   ├── utils/             # Project utility functions
│   ├── projects-command.controller.ts # Project command endpoints
│   ├── projects-query.controller.ts   # Project query endpoints
│   └── projects.module.ts    # Projects module
├── roles/
│   ├── commands/          # CQRS Command handlers
│   │   ├── create-role/
│   │   ├── update-role/
│   │   └── delete-role/
│   ├── queries/           # CQRS Query handlers
│   │   ├── find-all-roles/
│   │   ├── find-role-by-id/
│   │   └── find-role-by-slug/
│   ├── dto/               # Role DTOs
│   ├── types/             # Role type definitions
│   ├── __tests__/         # Role tests
│   ├── roles.controller.ts # Role endpoints
│   ├── roles.module.ts     # Roles module
│   └── README.md          # 📚 Roles documentation
├── facilities/
│   ├── dto/               # Facility DTOs
│   ├── facilities.controller.ts # Facility endpoints
│   ├── facilities.service.ts   # Facility business logic
│   └── facilities.module.ts    # Facilities module
├── cron/
│   ├── cron.service.ts    # Scheduled task management
│   └── cron.module.ts     # Cron module configuration
├── common/
│   ├── email/             # Email service
│   │   ├── email.service.ts
│   │   ├── email.module.ts
│   │   └── templates/     # HTML email templates
│   ├── logger/            # Logging service
│   │   ├── logger.service.ts
│   │   ├── logger.controller.ts # Log viewer endpoint
│   │   ├── logger.module.ts
│   │   └── README.md      # 📚 Logger documentation
│   └── prisma/
│       ├── prisma.service.ts
│       └── prisma.module.ts
├── scripts/
│   └── seed-facilities.ts # Database seeding script
├── public/
│   ├── log-viewer.html    # Real-time log viewer interface
│   ├── swagger-custom.js  # Swagger UI customizations
│   └── swagger-dark-theme.css # Dark theme for API docs
└── main.ts               # Swagger configuration
```

## Environment Variables

| Variable                          | Description                  | Default        |
| --------------------------------- | ---------------------------- | -------------- |
| `DATABASE_URL`                    | PostgreSQL connection string | Required       |
| `JWT_ACCESS_TOKEN_SECRET`         | JWT access token secret      | Required       |
| `JWT_REFRESH_TOKEN_SECRET`        | JWT refresh token secret     | Required       |
| `JWT_ACCESS_TOKEN_EXPIRATION_MS`  | Access token expiration      | 3600000 (1h)   |
| `JWT_REFRESH_TOKEN_EXPIRATION_MS` | Refresh token expiration     | 86400000 (24h) |
| `GOOGLE_CLIENT_ID`                | Google OAuth client ID       | Optional       |
| `GOOGLE_CLIENT_SECRET`            | Google OAuth client secret   | Optional       |
| `AUTH_UI_REDIRECT`                | Redirect URL after auth      | Required       |
| `SMTP_HOST`                       | SMTP server host             | Required       |
| `SMTP_PORT`                       | SMTP server port             | Required       |
| `SMTP_USER`                       | SMTP username                | Required       |
| `SMTP_PASS`                       | SMTP password                | Required       |
| `FROM_EMAIL`                      | From email address           | Required       |
| `FROM_NAME`                       | From name                    | Required       |
| `LOG_FORMAT`                      | Log output format            | false          |
| `LOG_LEVEL`                       | Logging level                | info           |
| `LOG_COLORS`                      | Enable colored logs          | true           |
| `SERVICE_NAME`                    | Service identifier in logs   | csguild-server |
| `NODE_ENV`                        | Environment                  | development    |

## Testing

```bash
# Unit tests
bun run test

# E2E tests
bun run test:e2e

# Test coverage
bun run test:cov
```

## 🚀 Development Workflow

### 1. Code Quality & Architecture

The system follows modern software engineering practices with emphasis on:

#### **SOLID Principles Implementation**
- **Single Responsibility**: Each method has one clear purpose (e.g., `validateProjectOwnership`, `executeRoleOperations`)
- **Open/Closed**: Modular design allows extension without modification
- **Dependency Inversion**: Clean separation between business logic and data layers

#### **Enhanced Maintainability Features**
- **Method Decomposition**: Large methods broken into focused, testable units
- **Consistent Data Handling**: Standardized default value application across operations
- **Error Isolation**: Centralized error handling with proper transformation
- **Transaction Management**: Atomic operations with proper rollback handling

#### **Testing & Development Benefits**
- **Unit Testing**: Individual methods can be tested independently
- **Debugging**: Clear separation makes issue identification easier
- **Code Reviews**: Smaller, focused methods improve review quality
- **Performance**: Optimized database queries and parallel operations

### 2. API Development

1. View API docs at `http://localhost:3000/api-docs`
2. Test endpoints interactively in Swagger UI
3. Check authentication flows and responses
4. Validate request/response schemas

### 3. Student Registration Testing

1. Create student via `POST /users`
2. Check email for verification code
3. Verify email via `POST /users/verify-email`
4. Login via `POST /auth/login`
5. Test protected routes with cookies
6. Test password reset via `POST /auth/forgot-password`
7. Check email for reset link and test `POST /auth/reset-password`
8. Register RFID card via `POST /users/register-rfid`
9. Test RFID login via `POST /auth/rfid-login`

### 4. Email Service Testing

1. Configure SMTP settings in `.env`
2. Test email verification flow
3. Check HTML email templates
4. Verify email delivery

### 5. Project Management Testing

1. Create projects via `POST /projects`
2. Test project filtering and search via `GET /projects`
3. Apply to projects via `POST /projects/join`
4. Review applications via `POST /projects/applications/review`
5. Test project updates and status changes
6. Check team member management
7. Test CQRS command and query separation

### 6. Role Management Testing

1. Browse roles via `GET /roles` (public access)
2. Search roles by name/description with pagination
3. Get role details via `GET /roles/:identifier` (by ID or slug)
4. Create roles via `POST /roles` (staff/admin authentication required)
5. Update roles via `PATCH /roles/:id` (staff/admin only)
6. Test role deletion protection for roles in use
7. Verify CQRS command and query patterns

### 7. Facility Management Testing

1. Create facilities via `POST /facilities`
2. Test RFID time-in/time-out via `POST /facilities/toggle`
3. Monitor real-time occupancy via `GET /facilities`
4. Check facility usage history and analytics
5. Test capacity management and overflow handling

### 8. Real-time Monitoring

1. Access log viewer at `http://localhost:3000/logs`
2. Monitor live application logs and HTTP requests
3. Test WebSocket connection and authentication
4. Observe cron job execution logs

### 9. Database Changes

1. Update `prisma/schema.prisma`
2. Run `bun run db:migrate`
3. Update DTOs and services
4. Test in Swagger UI

## 🔧 Customization

### Adding New Endpoints

1. Create DTOs with `@ApiProperty()` decorators
2. Add Swagger decorators to controllers
3. Update documentation in method descriptions
4. Test in Swagger UI

### Adding New Guards

1. Create guard extending `AuthGuard`
2. Document in `src/auth/guards/README.md`
3. Add usage examples
4. Update Swagger descriptions

### OAuth Providers

1. Add new strategy (e.g., Facebook, GitHub)
2. Create corresponding guard
3. Document in strategies README
4. Add Swagger documentation

### Email Templates

1. Create new Handlebars templates in `src/common/email/templates/`
2. Add corresponding service methods
3. Test email rendering
4. Update email service documentation

## 🎓 CSGUILD Features

### Student Management

- Complete student registration with academic information
- Email verification system for account security
- RFID card integration for physical access
- Role-based access control (STUDENT role)
- Google OAuth for easy registration

### Project Management

- **Complete project lifecycle management** with CQRS architecture
- **Team collaboration tools** with role-based assignments
- **Application and approval system** for project participation
- **Advanced project filtering** by status, tags, and search terms
- **Project ownership controls** for creators and administrators
- **Real-time project status tracking** from creation to completion

### Facility Management

- **Real-time occupancy tracking** for all facilities
- **Capacity management** with overflow protection
- **Time-in/Time-out system** via RFID or manual entry
- **Session duration calculation** and history tracking
- **Facility usage analytics** with pagination
- **Active session monitoring** for staff oversight

### Automated Systems

- **Daily User Timeout**: Automatic session cleanup at 8 PM daily
- **Orphaned Session Cleanup**: Data consistency maintenance
- **Cron Job Monitoring**: Scheduled task execution and logging
- **Background Process Management**: Automated facility maintenance

### Real-time Monitoring

- **Live Log Streaming**: WebSocket-based log viewer
- **System Health Monitoring**: Real-time application status
- **Authentication Logging**: Security event tracking
- **Performance Metrics**: Request/response monitoring

### Email Communication

- Automated email verification
- Welcome emails for new students
- **Password reset functionality with secure token-based links**
- RFID registration confirmations
- Professional HTML email templates

### Security Features

- Email verification required for login
- **Secure password reset with token-based links and 1-hour expiration**
- RFID-based authentication
- JWT token management
- Secure password hashing
- HTTP-only cookie authentication

## Migration from Template

This system has been customized from a generic NestJS authentication template to serve the Computer Science Guild:

- Added comprehensive student fields
- Implemented email verification system
- Added RFID authentication
- Created email service with templates
- Enhanced Google OAuth with auto-registration
- **Added project management system** with CQRS pattern and team collaboration
- **Enhanced project update architecture** with modular design and consistent data handling
- **Implemented facility management system** with occupancy tracking
- **Implemented automated user timeout** with cron jobs
- **Created real-time log viewer** with WebSocket authentication
- **Added comprehensive logging system** with multiple log levels
- **Enhanced API documentation** with dark theme and customizations
- **Improved code quality** with SOLID principles and method decomposition
- Updated all branding to CSGUILD


## License

This project is [MIT licensed](LICENSE).

## Support

For support with the CSGUILD backend system, please contact the development team or create an issue in the repository.
