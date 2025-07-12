
## 📋 API Endpoints Documentation

### Authentication Endpoints

| Method | Endpoint                | Description               | Authentication | Request Body                          | Response Body                                                                                                                            | Notes                                                                                      |
| ------ | ----------------------- | ------------------------- | -------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `POST` | `/auth/login`           | Login with email/password | None           | `{ email: string, password: string }` | `201` - `{ message: "Login successful", statusCode: 201 }`                                                                               | Requires email verification. Sets HTTP-only cookies. Rate limited (5 attempts per 15 min). |
| `POST` | `/auth/rfid-login`      | Login with RFID card      | None           | `{ rfidId: string }`                  | `200` - `{ message: "RFID login successful", statusCode: 200, student: { id, email, username, firstName, lastName, course, imageUrl } }` | Quick authentication for terminals. Returns student info.                                  |
| `POST` | `/auth/refresh`         | Refresh access token      | Refresh Cookie | None                                  | `201` - `{ message: "Tokens refreshed successfully", statusCode: 201 }`                                                                  | Uses refresh token from cookie. Updates both tokens.                                       |
| `POST` | `/auth/logout`          | Logout user               | JWT Cookie     | None                                  | `200` - `{ message: "Logout successful", statusCode: 200 }`                                                                              | Clears tokens and cookies. Invalidates refresh token.                                      |
| `POST` | `/auth/forgot-password` | Request password reset    | None           | `{ email: string }`                   | `200` - `{ message: "Password reset email sent if the email exists in our system", statusCode: 200 }`                                   | Sends reset link via email. No information leakage about email existence. 1-hour expiration. |
| `POST` | `/auth/reset-password`  | Reset password with token | None           | `{ token: string, newPassword: string }` | `200` - `{ message: "Password reset successful. Please log in with your new password.", statusCode: 200 }`                               | One-time use token. Invalidates all sessions. Minimum 8 characters for new password.       |
| `GET`  | `/auth/google`          | Initiate Google OAuth     | None           | None                                  | `302` - HTTP redirect to Google OAuth consent screen                                                                                     | Redirects to Google consent screen.                                                        |
| `GET`  | `/auth/google/callback` | Google OAuth callback     | None           | None                                  | `302` - HTTP redirect to frontend with authentication cookies set                                                                        | Handles OAuth callback. Auto-registers users.                                              |
| `GET`  | `/auth/me`              | Get current user          | JWT Cookie     | None                                  | `200` - `UserResponseDto` with current user details                                                                                      | Returns current authenticated user information.                                             |

### Student Management Endpoints

| Method | Endpoint                     | Description                 | Authentication           | Request Body                                  | Response Body                                                                                                                                                                                           | Notes                                                              |
| ------ | ---------------------------- | --------------------------- | ------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `POST` | `/users`                     | Register new student        | None                     | `CreateUserRequest`                           | `201` - `{ message: "Student registration successful. Please check your email for verification instructions.", statusCode: 201, details: "A verification email has been sent to your email address." }` | Sends verification email. Auto-generates username if not provided. |
| `POST` | `/users/verify-email`        | Verify email address        | None                     | `{ email: string, verificationCode: string }` | `200` - `{ message: "Email verified successfully", statusCode: 200, details: "Welcome to CSGUILD! You can now access all features." }`                                                                  | 6-digit verification code. Sends welcome email.                    |
| `POST` | `/users/resend-verification` | Resend verification code    | None                     | `{ email: string }`                           | `200` - `{ message: "Email verification code sent successfully", statusCode: 200, details: "Please check your email for the new verification code." }`                                                  | Generates new 6-digit code.                                        |
| `POST` | `/users/register-rfid`       | Register RFID card          | JWT Cookie               | `{ rfidId: string }`                          | `201` - `{ message: "RFID card registered successfully", statusCode: 201, details: "You can now use your RFID card to access CSGUILD services." }`                                                      | Links RFID to student account. Sends confirmation email.           |
| `POST` | `/users/rfid-login`          | Login with RFID (duplicate) | None                     | `{ rfidId: string }`                          | `200` - `{ message: "RFID login successful", statusCode: 200, student: { id, email, username, firstName, lastName } }`                                                                                  | Returns student info without creating session.                     |
| `GET`  | `/users`                     | Get all students            | JWT Cookie + STAFF/ADMIN | None                                          | `200` - Array of `UserResponseDto` objects with full student data                                                                                                                                       | Protected endpoint. Returns comprehensive student data.            |
| `GET`  | `/users/:id`                 | Get student by ID           | JWT Cookie               | None                                          | `200` - Single `UserResponseDto` object with full student data                                                                                                                                          | Students can only access own data. Staff/Admin can access any.     |
| `PATCH`| `/users/profile`             | Update user profile         | JWT Cookie               | `UpdateUserRequest`                           | `200` - Updated `UserResponseDto` object with updated user data                                                                                                                                         | Users can update their own profile information.                    |

### Facility Management Endpoints

| Method   | Endpoint          | Description               | Authentication           | Request Body        | Response Body                                                                                                                        | Notes                                                            |
| -------- | ----------------- | ------------------------- | ------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `POST`   | `/facilities`     | Create facility           | JWT Cookie + STAFF/ADMIN | `CreateFacilityDto` | `201` - `FacilityResponseDto` with `{ id, name, description, location, capacity, currentOccupancy, isActive, createdAt, updatedAt }` | Name must be unique. Includes occupancy info.                    |
| `GET`    | `/facilities`     | Get all active facilities | None                     | None                | `200` - Array of `FacilityResponseDto` objects with current occupancy data                                                           | Public endpoint. Includes current occupancy.                     |
| `GET`    | `/facilities/:id` | Get facility by ID        | None                     | None                | `200` - Single `FacilityResponseDto` object with real-time occupancy                                                                 | Public endpoint. Includes real-time occupancy.                   |
| `PUT`    | `/facilities/:id` | Update facility           | JWT Cookie + STAFF/ADMIN | `UpdateFacilityDto` | `200` - Updated `FacilityResponseDto` object                                                                                         | Can update name, description, location, capacity, active status. |
| `DELETE` | `/facilities/:id` | Delete facility           | JWT Cookie + STAFF/ADMIN | None                | `204` - No content (empty response body)                                                                                             | Soft delete. Cannot delete with active sessions.                 |

### Facility Access Control Endpoints

| Method | Endpoint                          | Description                 | Authentication           | Request Body                             | Response Body                                                                                                                                                                                                                                                   | Notes                                          |
| ------ | --------------------------------- | --------------------------- | ------------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `POST` | `/facilities/toggle`              | Toggle facility access      | None                     | `{ rfidId: string, facilityId: string }` | `200/201` - `FacilityToggleResponseDto` with `{ message, statusCode, action, details, student: { id, firstName, lastName, username, email, imageUrl, course }, facility: { id, name, location }, session: { id, timeIn, timeOut, isActive, durationMinutes } }` | Smart endpoint: auto-detects time-in/time-out. |
| `POST` | `/facilities/status`              | Check facility usage status | None                     | `{ rfidId: string, facilityId: string }` | `200` - `{ message: "Usage status retrieved successfully", statusCode: 200, isCurrentlyInFacility: boolean, currentSession: FacilityUsageResponseDto \| null }`                                                                                                 | Check if student is in facility.               |
| `GET`  | `/facilities/:id/active-sessions` | Get active sessions         | JWT Cookie + STAFF/ADMIN | None                                     | `200` - Array of `FacilityUsageResponseDto` objects with `{ id, student: { id, firstName, lastName, username, email }, facility: { id, name, location }, timeIn, timeOut, isActive, durationMinutes }`                                                          | Real-time facility occupancy.                  |
| `GET`  | `/facilities/:id/usage-history`   | Get facility usage history  | JWT Cookie + STAFF/ADMIN | Query: `page`, `limit`                   | `200` - `{ data: FacilityUsageResponseDto[], total: number, page: number, limit: number }` where each usage record contains student info, facility info, session times, and duration                                                                            | Historical usage data with pagination.         |

### Project Management Endpoints

| Method   | Endpoint                         | Description                    | Authentication | Request Body               | Response Body                                                                                                                                         | Notes                                                    |
| -------- | -------------------------------- | ------------------------------ | -------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `POST`   | `/projects`                      | Create new project             | JWT Bearer     | `CreateProjectDto`         | `201` - `CreateProjectResponseDto` with project details including roles, owner info, and member counts                                               | Requires title, description, tags, and at least 1 role. |
| `GET`    | `/projects`                      | Get all projects with filters  | None           | Query parameters           | `200` - `ProjectListResponseDto` with pagination and filtering options                                                                                | Supports filtering by status, tags, search, owner. Public endpoint. |
| `GET`    | `/projects/my-projects`          | Get current user's projects    | JWT Bearer     | None                       | `200` - Array of `ProjectSummaryResponseDto` for owned and member projects                                                                            | Shows projects user owns or is a member of.             |
| `GET`    | `/projects/my-applications`      | Get current user's applications| JWT Bearer     | None                       | `200` - Array of `ProjectApplicationResponseDto` with application status and project details                                                          | Shows all applications user has submitted.              |
| `GET`    | `/projects/:id`                  | Get project by ID              | None           | None                       | `200` - `ProjectDetailResponseDto` with complete project details, members, applications, and roles                                                    | Full project details including team composition. Public endpoint. |
| `PATCH`  | `/projects/:id`                  | Update project                 | JWT Bearer     | `UpdateProjectDto`         | `200` - Updated `ProjectDetailResponseDto`                                                                                                            | Only project owner can update. Can modify roles.       |
| `PATCH`  | `/projects/:id/status`           | Update project status          | JWT Bearer     | `UpdateProjectStatusDto`   | `200` - Updated `ProjectDetailResponseDto`                                                                                                            | Only project owner can change status.                   |
| `DELETE` | `/projects/:id`                  | Delete project                 | JWT Bearer     | None                       | `200` - `{ message: "Project deleted successfully" }`                                                                                                 | Only project owner can delete. Cascade deletes.        |
| `POST`   | `/projects/join`                 | Apply to join project          | JWT Bearer     | `JoinProjectDto`           | `201` - `JoinProjectResponseDto` with application details                                                                                             | Creates application. Prevents duplicate applications.   |
| `POST`   | `/projects/applications/review`  | Review project application     | JWT Bearer     | `ReviewApplicationDto`     | `200` - Updated `ProjectApplicationResponseDto` with review details                                                                                    | Only project owner can review. Approves/rejects apps.   |

### Role Management Endpoints

| Method   | Endpoint           | Description                    | Authentication           | Request Body        | Response Body                                                                                                         | Notes                                                    |
| -------- | ------------------ | ------------------------------ | ------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `GET`    | `/roles`           | Get all roles with filters     | None                     | Query parameters    | `200` - `RoleListResponseDto` with pagination and filtering options                                                   | Public endpoint. Supports search, pagination, sorting.  |
| `GET`    | `/roles/:id`       | Get role by ID                 | None                     | None                | `200` - `RoleResponseDto` with role details                                                                           | Public endpoint. Accepts ID as identifier.              |
| `GET`    | `/roles/slug/:slug`| Get role by slug               | None                     | None                | `200` - `RoleResponseDto` with role details                                                                           | Public endpoint. Accepts slug as identifier.            |
| `POST`   | `/roles`           | Create new role                | JWT Bearer + STAFF/ADMIN | `CreateRoleDto`     | `201` - `CreateRoleResponseDto` with created role details                                                             | Only staff/admin can create. Auto-generates slug.       |
| `PATCH`  | `/roles/:id`       | Update role                    | JWT Bearer + STAFF/ADMIN | `UpdateRoleDto`     | `200` - `UpdateRoleResponseDto` with updated role details                                                             | Only staff/admin can update. Validates uniqueness.      |
| `DELETE` | `/roles/:id`       | Delete role                    | JWT Bearer + STAFF/ADMIN | None                | `200` - `{ message: "Role deleted successfully" }`                                                                    | Only staff/admin can delete. Prevents deletion if in use. |

### System Endpoints

| Method | Endpoint  | Description          | Authentication | Request Body | Response Body                                                         | Notes                  |
| ------ | --------- | -------------------- | -------------- | ------------ | --------------------------------------------------------------------- | ---------------------- |
| `GET`  | `/health` | Check server health  | None           | None         | `200` - `{ status: "ok" }` or similar health status object            | Health check endpoint. |
| `GET`  | `/logs`   | Log viewer interface | None           | None         | `200` - HTML document with tabbed interface for real-time log viewing | Real-time log viewer.  |

### Request/Response Examples

#### Student Registration (`POST /users`)

**Request:**

```json
{
  "email": "john.doe@example.com",
  "username": "johndoe123",
  "password": "MyStr0ngP@ssw0rd!",
  "firstName": "John",
  "lastName": "Doe",
  "birthdate": "2000-01-15",
  "course": "Bachelor of Science in Computer Science",
  "rfidId": "RF001234567"
}
```

**Response:**

```json
{
  "message": "Student registration successful. Please check your email for verification instructions.",
  "statusCode": 201,
  "details": "A verification email has been sent to your email address."
}
```

#### Login (`POST /auth/login`)

**Request:**

```json
{
  "email": "john.doe@example.com",
  "password": "MyStr0ngP@ssw0rd!"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "statusCode": 201
}
```

#### Facility Toggle (`POST /facilities/toggle`)

**Request:**

```json
{
  "rfidId": "RF001234567",
  "facilityId": "clm7x8k9e0000v8og4n2h5k7s"
}
```

**Response (Time-In):**

```json
{
  "message": "Time-in successful",
  "statusCode": 201,
  "action": "time-in",
  "details": "Successfully checked in to Computer Lab 1",
  "student": {
    "id": "clm7x8k9e0000v8og4n2h5k7s",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe123",
    "email": "john.doe@example.com",
    "imageUrl": "https://example.com/avatar.jpg",
    "course": "Bachelor of Science in Computer Science"
  },
  "facility": {
    "id": "clm7x8k9e0000v8og4n2h5k7s",
    "name": "Computer Lab 1",
    "location": "Building A, 2nd Floor"
  },
  "session": {
    "id": "clm7x8k9e0000v8og4n2h5k7s",
    "timeIn": "2024-07-05T05:36:19.000Z",
    "timeOut": null,
    "isActive": true,
    "durationMinutes": null
  }
}
```

#### Create Facility (`POST /facilities`)

**Request:**

```json
{
  "name": "Computer Lab 1",
  "description": "Main computer laboratory with 30 workstations",
  "location": "Building A, 2nd Floor",
  "capacity": 30,
  "isActive": true
}
```

**Response:**

```json
{
  "id": "clm7x8k9e0000v8og4n2h5k7s",
  "name": "Computer Lab 1",
  "description": "Main computer laboratory with 30 workstations",
  "location": "Building A, 2nd Floor",
  "capacity": 30,
  "currentOccupancy": 0,
  "isActive": true,
  "createdAt": "2024-07-05T05:36:19.000Z",
  "updatedAt": "2024-07-05T05:36:19.000Z"
}
```

#### Get Student Data (`GET /users/:id`)

**Response:**

```json
{
  "id": "clm7x8k9e0000v8og4n2h5k7s",
  "email": "john.doe@example.com",
  "username": "johndoe123",
  "firstName": "John",
  "lastName": "Doe",
  "birthdate": "2000-01-15T00:00:00.000Z",
  "course": "Bachelor of Science in Computer Science",
  "imageUrl": "https://lh3.googleusercontent.com/a/default-user=s96-c",
  "emailVerified": true,
  "hasRefreshToken": true,
  "hasRfidCard": true,
  "roles": ["STUDENT"],
  "signupMethod": "EMAIL",
  "createdAt": "2024-07-05T05:36:19.000Z",
  "updatedAt": "2024-07-05T05:36:19.000Z"
}
```

#### Email Verification (`POST /users/verify-email`)

**Request:**

```json
{
  "email": "john.doe@example.com",
  "verificationCode": "123456"
}
```

**Response:**

```json
{
  "message": "Email verified successfully",
  "statusCode": 200,
  "details": "Welcome to CSGUILD! You can now access all features."
}
```

#### Forgot Password (`POST /auth/forgot-password`)

**Request:**

```json
{
  "email": "john.doe@example.com"
}
```

**Response:**

```json
{
  "message": "Password reset email sent if the email exists in our system",
  "statusCode": 200
}
```

#### Get Current User (`GET /auth/me`)

**Authentication Required:** JWT Cookie in `Authentication` header

**Response:**

```json
{
  "id": "clm7x8k9e0000v8og4n2h5k7s",
  "email": "john.doe@example.com",
  "username": "johndoe123",
  "firstName": "John",
  "lastName": "Doe",
  "birthdate": "2000-01-15T00:00:00.000Z",
  "course": "Bachelor of Science in Computer Science",
  "imageUrl": "https://lh3.googleusercontent.com/a/default-user=s96-c",
  "emailVerified": true,
  "hasRefreshToken": true,
  "hasRfidCard": true,
  "rfidId": "RF001234567",
  "roles": ["STUDENT"],
  "signupMethod": "EMAIL",
  "currentFacilityId": null,
  "createdAt": "2024-07-05T05:36:19.000Z",
  "updatedAt": "2024-07-05T05:36:19.000Z"
}
```

#### Reset Password (`POST /auth/reset-password`)

**Request:**

```json
{
  "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "newPassword": "MyNewStr0ngP@ssw0rd!"
}
```

**Response:**

```json
{
  "message": "Password reset successful. Please log in with your new password.",
  "statusCode": 200
}
```

#### Create Project (`POST /projects`)

**Authentication Required:** JWT Bearer token in Authorization header

**Request:**

```json
{
  "title": "CS Guild Mobile App Development",
  "description": "We are looking for developers to help build a mobile application for the CS Guild community. The app will include features for project collaboration, event management, and member networking.",
  "tags": ["mobile", "react-native", "typescript", "collaboration"],
  "dueDate": "2024-12-31T23:59:59.000Z",
  "roles": [
    {
      "roleId": "clm7x8k9e0000v8og4n2h5k7s",
      "maxMembers": 2,
      "requirements": "Experience with React Native and TypeScript required"
    },
    {
      "roleId": "clm7x8k9e0000v8og4n2h5k8t",
      "maxMembers": 1,
      "requirements": "Experience with UI/UX design and Figma"
    }
  ]
}
```

**Response:**

```json
{
  "message": "Project created successfully",
  "statusCode": 201,
  "project": {
    "id": "clm7x8k9e0000v8og4n2h5k7s",
    "title": "CS Guild Mobile App Development",
    "description": "We are looking for developers to help build a mobile application for the CS Guild community.",
    "tags": ["mobile", "react-native", "typescript", "collaboration"],
    "dueDate": "2024-12-31T23:59:59.000Z",
    "status": "OPEN",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "owner": {
      "id": "clm7x8k9e0000v8og4n2h5k7s",
      "username": "johndoe123",
      "firstName": "John",
      "lastName": "Doe",
      "imageUrl": "https://example.com/avatar.jpg"
    },
    "roles": [
      {
        "id": "clm7x8k9e0000v8og4n2h5k7s",
        "role": {
          "id": "clm7x8k9e0000v8og4n2h5k7s",
          "name": "Frontend Developer",
          "slug": "frontend-developer"
        },
        "maxMembers": 2,
        "currentMembers": 0,
        "requirements": "Experience with React Native and TypeScript required"
      }
    ],
    "memberCount": 0,
    "applicationCount": 0,
    "members": [],
    "applications": []
  }
}
```

#### Join Project (`POST /projects/join`)

**Authentication Required:** JWT Bearer token in Authorization header

**Request:**

```json
{
  "projectId": "clm7x8k9e0000v8og4n2h5k7s",
  "projectRoleId": "clm7x8k9e0000v8og4n2h5k7t",
  "message": "I have 3 years of experience with React Native and would love to contribute to this project. I have previously worked on similar mobile applications and am excited about the CS Guild community."
}
```

**Response:**

```json
{
  "message": "Application submitted successfully",
  "statusCode": 201,
  "application": {
    "id": "clm7x8k9e0000v8og4n2h5k7s",
    "user": {
      "id": "clm7x8k9e0000v8og4n2h5k7s",
      "username": "janedoe456",
      "firstName": "Jane",
      "lastName": "Doe",
      "imageUrl": "https://example.com/jane-avatar.jpg"
    },
    "projectRole": {
      "id": "clm7x8k9e0000v8og4n2h5k7t",
      "role": {
        "id": "clm7x8k9e0000v8og4n2h5k7s",
        "name": "Frontend Developer",
        "slug": "frontend-developer"
      }
    },
    "message": "I have 3 years of experience with React Native and would love to contribute to this project.",
    "status": "PENDING",
    "appliedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Get Projects with Filtering (`GET /projects`)

**Authentication Required:** None (Public endpoint)

**Query Parameters:**
- `status` - Filter by project status (OPEN, IN_PROGRESS, COMPLETED, CANCELLED)
- `tags` - Comma-separated list of tags to filter by
- `search` - Search in project title and description  
- `ownerId` - Filter by project owner ID
- `page` - Page number for pagination (default: 1)
- `limit` - Number of items per page (default: 10, max: 100)
- `sortBy` - Field to sort by (createdAt, updatedAt, dueDate, title, default: createdAt)
- `sortOrder` - Sort direction (asc, desc, default: desc)

**Example Request:**
`GET /projects?status=OPEN&tags=mobile,typescript&page=1&limit=5&sortBy=createdAt&sortOrder=desc`

**Response:**

```json
{
  "data": [
    {
      "id": "clm7x8k9e0000v8og4n2h5k7s",
      "title": "CS Guild Mobile App Development",
      "description": "We are looking for developers to help build a mobile application for the CS Guild community.",
      "tags": ["mobile", "react-native", "typescript", "collaboration"],
      "dueDate": "2024-12-31T23:59:59.000Z",
      "status": "OPEN",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "owner": {
        "id": "clm7x8k9e0000v8og4n2h5k7s",
        "username": "johndoe123",
        "firstName": "John",
        "lastName": "Doe"
      },
      "roles": [
        {
          "id": "clm7x8k9e0000v8og4n2h5k7s",
          "role": {
            "name": "Frontend Developer",
            "slug": "frontend-developer"
          },
          "maxMembers": 2,
          "currentMembers": 1
        }
      ],
      "memberCount": 1,
      "applicationCount": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 15,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Review Application (`POST /projects/applications/review`)

**Request:**

```json
{
  "applicationId": "clm7x8k9e0000v8og4n2h5k7s",
  "decision": "APPROVED",
  "reviewMessage": "Welcome to the team! Your experience looks great."
}
```

**Response:**

```json
{
  "id": "clm7x8k9e0000v8og4n2h5k7s",
  "user": {
    "id": "clm7x8k9e0000v8og4n2h5k7s",
    "username": "janedoe456",
    "firstName": "Jane",
    "lastName": "Doe",
    "imageUrl": "https://example.com/jane-avatar.jpg"
  },
  "projectRole": {
    "id": "clm7x8k9e0000v8og4n2h5k7t",
    "role": {
      "id": "clm7x8k9e0000v8og4n2h5k7s",
      "name": "Frontend Developer",
      "slug": "frontend-developer"
    }
  },
  "message": "I have 3 years of experience with React Native and would love to contribute to this project.",
  "status": "APPROVED",
  "appliedAt": "2024-01-02T00:00:00.000Z",
  "reviewedAt": "2024-01-03T00:00:00.000Z",
  "reviewer": {
    "id": "clm7x8k9e0000v8og4n2h5k7s",
    "username": "johndoe123",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Authentication Methods

1. **JWT Cookies**:
   - `Authentication`: Access token (1 hour)
   - `Refresh`: Refresh token (24 hours)
   - HTTP-only, secure cookies

2. **RFID Authentication**:
   - No session required
   - Direct card-to-student mapping
   - Requires email verification

3. **Google OAuth**:
   - Automatic account creation
   - Email auto-verification
   - Seamless login flow

### Role-Based Access Control

- **STUDENT**: Default role, basic access
- **STAFF**: Facility management, student data access
- **ADMIN**: Full system access

### Rate Limiting

- **Login attempts**: 5 per IP per 15 minutes
- **Email verification**: Standard rate limiting
- **RFID operations**: No rate limiting (hardware integration)

### Error Handling

All endpoints return standardized error responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Security Features

- **Password Requirements**: Strong passwords with mixed case, numbers, special characters
- **Email Verification**: Required before full access
- **RFID Validation**: Unique card registration
- **Token Security**: HTTP-only cookies, refresh rotation
- **Role Protection**: Endpoint-level authorization

#### Create Role (`POST /roles`)

**Authentication Required:** JWT Bearer token with STAFF or ADMIN role

**Request:**

```json
{
  "name": "Frontend Developer",
  "description": "Responsible for building and maintaining user interfaces using modern web technologies"
}
```

**Response:**

```json
{
  "message": "Role created successfully",
  "statusCode": 201,
  "role": {
    "id": "clm7x8k9e0000v8og4n2h5k7s",
    "name": "Frontend Developer",
    "slug": "frontend-developer",
    "description": "Responsible for building and maintaining user interfaces using modern web technologies",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get Roles (`GET /roles`)

**Request:**

```
GET /roles?search=frontend&page=1&limit=10&sortBy=name&sortOrder=asc
```

**Response:**

```json
{
  "message": "Roles retrieved successfully",
  "statusCode": 200,
  "data": [
    {
      "id": "clm7x8k9e0000v8og4n2h5k7s",
      "name": "Frontend Developer",
      "slug": "frontend-developer",
      "description": "Responsible for building and maintaining user interfaces using modern web technologies",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### Update Role (`PATCH /roles/:id`)

**Authentication Required:** JWT Bearer token with STAFF or ADMIN role

**Request:**

```json
{
  "name": "Senior Frontend Developer",
  "description": "Lead frontend development initiatives and mentor junior developers"
}
```

**Response:**

```json
{
  "message": "Role updated successfully",
  "statusCode": 200,
  "role": {
    "id": "clm7x8k9e0000v8og4n2h5k7s",
    "name": "Senior Frontend Developer",
    "slug": "senior-frontend-developer",
    "description": "Lead frontend development initiatives and mentor junior developers",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

#### Get Role by Slug (`GET /roles/slug/:slug`)

**Request:**

```
GET /roles/slug/frontend-developer
```

**Response:**

```json
{
  "id": "clm7x8k9e0000v8og4n2h5k7s",
  "name": "Frontend Developer",
  "slug": "frontend-developer",
  "description": "Responsible for building and maintaining user interfaces using modern web technologies",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Update User Profile (`PATCH /users/profile`)

**Authentication Required:** JWT Cookie in `Authentication` header

**Request:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "course": "Bachelor of Science in Information Technology",
  "birthdate": "2000-01-15T00:00:00.000Z"
}
```

**Response:**

```json
{
  "id": "clm7x8k9e0000v8og4n2h5k7s",
  "email": "john.doe@example.com",
  "username": "johndoe123",
  "firstName": "John",
  "lastName": "Smith",
  "birthdate": "2000-01-15T00:00:00.000Z",
  "course": "Bachelor of Science in Information Technology",
  "imageUrl": "https://lh3.googleusercontent.com/a/default-user=s96-c",
  "emailVerified": true,
  "hasRefreshToken": true,
  "hasRfidCard": true,
  "rfidId": "RF001234567",
  "roles": ["STUDENT"],
  "signupMethod": "EMAIL",
  "createdAt": "2024-07-05T05:36:19.000Z",
  "updatedAt": "2024-07-05T06:15:30.000Z"
}
```