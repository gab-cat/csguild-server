-- CreateEnum
CREATE TYPE "SignupMethod" AS ENUM ('GOOGLE', 'EMAIL', 'FACEBOOK', 'APPLE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "signupMethod" "SignupMethod" DEFAULT 'EMAIL';
