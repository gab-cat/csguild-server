# Roles Module

The Roles module provides a comprehensive CQRS-based system for managing user roles in the CSGUILD application. This module allows staff and admin users to create, update, and delete roles, while providing public access to role information.

## Features

- ✅ **CQRS Architecture**: Implements Command Query Responsibility Segregation pattern
- 🔒 **Role-based Access Control**: Staff and admin permissions for mutations, public read access
- 📝 **Comprehensive Validation**: Input validation with detailed error messages
- 🔍 **Advanced Search & Filtering**: Search by name, slug, or description
- 📄 **Pagination Support**: Efficient pagination for large role lists
- 🎯 **Flexible Querying**: Find roles by ID or slug
- 🧪 **Full Test Coverage**: Unit tests for controllers and DTOs
- 📚 **Swagger Documentation**: Complete API documentation

## API Endpoints

### Public Endpoints (No Authentication Required)

- `GET /roles` - Get all roles with filtering and pagination
- `GET /roles/:identifier` - Get role by ID or slug

### Staff/Admin Only Endpoints (Authentication + Staff/Admin Role Required)

- `POST /roles` - Create a new role
- `PATCH /roles/:id` - Update an existing role
- `DELETE /roles/:id` - Delete a role (only if not in use)

## CQRS Implementation

### Commands (Write Operations)

- **CreateRoleCommand** - Create new roles with automatic slug generation
- **UpdateRoleCommand** - Modify role details with conflict detection
- **DeleteRoleCommand** - Remove roles with usage validation

### Queries (Read Operations)

- **FindAllRolesQuery** - List roles with search and pagination
- **FindRoleByIdQuery** - Get role details by ID
- **FindRoleBySlugQuery** - Get role details by slug

## Data Structure

```typescript
interface UserRole {
  id: string;           // Unique identifier
  name: string;         // Human-readable role name
  slug: string;         // URL-friendly identifier (auto-generated)
  description?: string; // Optional role description
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

## Usage Examples

### Creating a Role (Staff/Admin Only)

```typescript
POST /roles
Authorization: Bearer <jwt-token>

{
  "name": "Frontend Developer",
  "description": "Responsible for building and maintaining user interfaces using modern web technologies"
}
```

### Searching Roles (Public)

```typescript
GET /roles?search=frontend&page=1&limit=10&sortBy=name&sortOrder=asc
```

### Getting Role by ID or Slug (Public)

```typescript
GET /roles/clm7x8k9e0000v8og4n2h5k7s  // By ID
GET /roles/frontend-developer           // By slug
```

### Updating a Role (Staff/Admin Only)

```typescript
PATCH /roles/clm7x8k9e0000v8og4n2h5k7s
Authorization: Bearer <jwt-token>

{
  "name": "Senior Frontend Developer",
  "description": "Lead frontend development initiatives and mentor junior developers"
}
```

## Validation Rules

### Role Name
- Required for creation
- 2-100 characters
- Must be unique

### Role Slug
- Optional (auto-generated from name if not provided)
- 2-100 characters
- Must match pattern: `^[a-z0-9-]+$`
- Must be unique

### Role Description
- Optional
- Maximum 500 characters

## Security Features

- **Authentication Required**: Staff/admin operations require valid JWT token
- **Role-based Authorization**: Only `STAFF` and `ADMIN` roles can create/update/delete
- **Conflict Prevention**: Prevents duplicate names and slugs
- **Usage Validation**: Prevents deletion of roles assigned to users or projects

## Error Handling

- **400 Bad Request**: Validation failures
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Role not found
- **409 Conflict**: Duplicate name/slug or role in use

## Testing

The module includes comprehensive test coverage:

```bash
# Run role-specific tests
npm test -- --testPathPattern=roles

# Run with coverage
npm run test:cov -- --testPathPattern=roles
```

### Test Categories

- **Controller Tests**: API endpoint behavior and responses
- **DTO Validation Tests**: Input validation and error handling
- **Handler Tests**: Command and query execution logic

## Integration with Projects

Roles created through this module can be used in the Projects module for:

- Defining project role requirements
- Team member assignments
- Application filtering

## Development Guidelines

1. **Adding New Commands**: Follow the existing CQRS pattern
2. **Extending Validation**: Use class-validator decorators
3. **Error Handling**: Use appropriate HTTP status codes
4. **Testing**: Maintain high test coverage
5. **Documentation**: Update Swagger annotations

## Database Schema

The roles are stored in the `user_roles` table with the following indexes:

- Primary key on `id`
- Unique index on `slug`
- Index on `name` for search performance

## Future Enhancements

- Role permissions and capabilities
- Role hierarchies and inheritance
- Audit logging for role changes
- Bulk operations for role management
