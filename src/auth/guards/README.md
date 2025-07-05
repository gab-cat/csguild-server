# Authentication Guards

This directory contains NestJS guards that protect routes and control access to your API endpoints. Guards determine whether a request should be allowed to proceed based on authentication and authorization rules.

## Overview

| Guard                 | Purpose                       | Strategy Used        | When to Use             |
| --------------------- | ----------------------------- | -------------------- | ----------------------- |
| `LocalAuthGuard`      | Email/password authentication | `LocalStrategy`      | Login endpoints         |
| `JwtAuthGuard`        | JWT token validation          | `JwtStrategy`        | Protected routes        |
| `JwtRefreshAuthGuard` | Refresh token validation      | `JwtRefreshStrategy` | Token refresh endpoints |
| `GoogleAuthGuard`     | Google OAuth flow             | `GoogleStrategy`     | Google authentication   |

## Guards in Detail

### LocalAuthGuard

**File:** `local-auth.guard.ts`

**Purpose:** Validates user credentials (email and password) for local authentication.

**Usage:**

```typescript
@Post('login')
@UseGuards(LocalAuthGuard)
async login(@CurrentUser() user: User, @Res() response: Response) {
  // User is authenticated, proceed with login logic
}
```

**How it works:**

1. Extracts email and password from request body
2. Uses `LocalStrategy` to validate credentials
3. Calls `AuthService.verifyUser()` to check credentials against database
4. If valid, user object is attached to request
5. If invalid, throws `UnauthorizedException`

**Required request format:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### JwtAuthGuard

**File:** `jwt-auth.guard.ts`

**Purpose:** Validates JWT access tokens to protect routes requiring authentication.

**Usage:**

```typescript
@Get('protected')
@UseGuards(JwtAuthGuard)
async getProtectedData(@CurrentUser() user: User) {
  // User is authenticated, access granted
}
```

**How it works:**

1. Extracts JWT token from `Authentication` cookie
2. Uses `JwtStrategy` to validate and decode token
3. Fetches user from database using token's `userId`
4. If valid, user object is attached to request
5. If invalid/expired, throws `UnauthorizedException`

**Required cookies:**

- `Authentication`: Valid JWT access token

### JwtRefreshAuthGuard

**File:** `jwt-refresh-auth.guard.ts`

**Purpose:** Validates refresh tokens for token renewal.

**Usage:**

```typescript
@Post('refresh')
@UseGuards(JwtRefreshAuthGuard)
async refreshToken(@CurrentUser() user: User, @Res() response: Response) {
  // Refresh token is valid, generate new tokens
}
```

**How it works:**

1. Extracts JWT refresh token from `Refresh` cookie
2. Uses `JwtRefreshStrategy` to validate token
3. Compares token with hashed version in database
4. If valid, user object is attached to request
5. If invalid/expired, throws `UnauthorizedException`

**Required cookies:**

- `Refresh`: Valid JWT refresh token

### GoogleAuthGuard

**File:** `google-auth.guard.ts`

**Purpose:** Handles Google OAuth 2.0 authentication flow.

**Usage:**

```typescript
// Initiate OAuth flow
@Get('google')
@UseGuards(GoogleAuthGuard)
loginGoogle() {
  // Redirects to Google OAuth consent screen
}

// Handle OAuth callback
@Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleCallback(@CurrentUser() user: User) {
  // User authenticated via Google, proceed with login
}
```

**How it works:**

1. **Initiation:** Redirects user to Google OAuth consent screen
2. **Callback:** Receives authorization code from Google
3. Uses `GoogleStrategy` to exchange code for user profile
4. Creates or finds existing user account
5. User object is attached to request

**Required environment variables:**

- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

## Implementation Details

### Guard Base Class

All guards extend NestJS `AuthGuard` from `@nestjs/passport`:

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CustomAuthGuard extends AuthGuard('strategy-name') {}
```

### Error Handling

Guards automatically throw appropriate HTTP exceptions:

- **401 Unauthorized**: Invalid credentials, expired tokens
- **403 Forbidden**: Valid user but insufficient permissions
- **400 Bad Request**: Malformed request data

### Custom Decorators

Use `@CurrentUser()` decorator to access authenticated user:

```typescript
import { CurrentUser } from '../current-user.decorator';

@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

## Best Practices

### 1. Guard Selection

- Use `LocalAuthGuard` only for login endpoints
- Use `JwtAuthGuard` for all protected routes
- Use `JwtRefreshAuthGuard` only for token refresh
- Use `GoogleAuthGuard` for OAuth flow endpoints

### 2. Route Protection

```typescript
// ✅ Good: Protect sensitive routes
@Get('admin/users')
@UseGuards(JwtAuthGuard)
async getAdminData() { ... }

// ❌ Bad: Don't protect public routes
@Get('health')
@UseGuards(JwtAuthGuard) // Unnecessary
async healthCheck() { ... }
```

### 3. Global vs Route-level Guards

```typescript
// Global guard (apply to all routes)
app.useGlobalGuards(new JwtAuthGuard());

// Route-level guard (apply to specific routes)
@UseGuards(JwtAuthGuard)
```

### 4. Multiple Guards

```typescript
// Apply multiple guards (all must pass)
@UseGuards(JwtAuthGuard, AdminGuard)
async adminOnlyEndpoint() { ... }
```

## Testing Guards

### Unit Testing

```typescript
describe('JwtAuthGuard', () => {
  it('should allow access with valid token', async () => {
    // Mock valid token
    // Test guard allows request
  });

  it('should deny access with invalid token', async () => {
    // Mock invalid token
    // Test guard throws UnauthorizedException
  });
});
```

### Integration Testing

```typescript
describe('Protected Endpoint', () => {
  it('should return data when authenticated', async () => {
    return request(app.getHttpServer())
      .get('/protected')
      .set('Cookie', 'Authentication=validtoken')
      .expect(200);
  });

  it('should return 401 when unauthenticated', async () => {
    return request(app.getHttpServer()).get('/protected').expect(401);
  });
});
```

## Troubleshooting

### Common Issues

1. **Token not found in cookies**
   - Ensure frontend sends cookies with requests
   - Check cookie domain and path settings
   - Verify CORS configuration

2. **Invalid token signature**
   - Check JWT secret configuration
   - Ensure secrets match between environments
   - Verify token generation process

3. **Google OAuth failures**
   - Verify Google client credentials
   - Check redirect URI configuration
   - Ensure OAuth consent screen is configured

### Debug Tips

1. **Enable debug logging:**

```typescript
// In strategy files
console.log('Token payload:', payload);
console.log('User found:', user);
```

2. **Check cookie values:**

```typescript
// In guard context
console.log('Cookies:', request.cookies);
```

3. **Verify database queries:**

```typescript
// In user service
console.log('Searching user with:', query);
```
