# NestJS Authentication Template with PostgreSQL & Prisma

A comprehensive NestJS authentication template featuring:
- **PostgreSQL** database with **Prisma** ORM
- JWT Authentication (Access & Refresh tokens)
- Google OAuth2 integration
- Local authentication (email/password)
- Cookie-based token storage
- TypeScript support
- Docker setup for development
- **Complete Swagger/OpenAPI documentation**

## Features

- 🔐 JWT Authentication with refresh tokens
- 🚀 Google OAuth2 integration
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
DATABASE_URL="postgresql://username:password@localhost:5432/auth_template?schema=public"

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
bun run start:dev

# Production mode
bun run start:prod

# Debug mode
bun run start:debug
```

The application will be available at `http://localhost:3000`

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
- **Error Responses**: Detailed error codes and messages
- **Cookie Authentication**: HTTP-only cookie setup explained
- **OAuth Flow**: Google OAuth integration walkthrough
- **Guard Documentation**: When and how to use each guard
- **Strategy Details**: Authentication strategy implementations

### Quick API Reference

#### Authentication Endpoints
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback

#### User Endpoints
- `POST /users` - Create new user
- `GET /users` - Get all users (protected)

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
- `GoogleStrategy` - OAuth 2.0 flow

### Authentication Flow

1. **Registration**: `POST /users` with email/password
2. **Login**: `POST /auth/login` with credentials
3. **Access Protected Routes**: Automatic cookie-based auth
4. **Token Refresh**: `POST /auth/refresh` when token expires
5. **Google OAuth**: `GET /auth/google` for social login

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
│   ├── models/            # User interfaces
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
└── main.ts               # Swagger configuration
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_ACCESS_TOKEN_SECRET` | JWT access token secret | Required |
| `JWT_REFRESH_TOKEN_SECRET` | JWT refresh token secret | Required |
| `JWT_ACCESS_TOKEN_EXPIRATION_MS` | Access token expiration | 3600000 (1h) |
| `JWT_REFRESH_TOKEN_EXPIRATION_MS` | Refresh token expiration | 86400000 (24h) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |
| `AUTH_UI_REDIRECT` | Redirect URL after auth | Required |
| `NODE_ENV` | Environment | development |

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

### 1. API Development
1. View API docs at `http://localhost:3000/api-docs`
2. Test endpoints interactively in Swagger UI
3. Check authentication flows and responses
4. Validate request/response schemas

### 2. Authentication Testing
1. Create user via `POST /users`
2. Login via `POST /auth/login` 
3. Test protected routes with cookies
4. Try token refresh flow
5. Test Google OAuth if configured

### 3. Database Changes
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

## Migration from MongoDB

This template has been migrated from MongoDB to PostgreSQL + Prisma. Key changes:
- Replaced `@nestjs/mongoose` with Prisma
- Changed `_id` fields to `id` with CUID
- Updated all database queries to use Prisma Client
- Replaced MongoDB-specific operations with Prisma equivalents

## License

This project is [MIT licensed](LICENSE).
