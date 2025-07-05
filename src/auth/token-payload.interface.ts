import { Role } from 'generated/prisma/client';

export interface TokenPayload {
  userId: string;
  roles: Role[];
}
