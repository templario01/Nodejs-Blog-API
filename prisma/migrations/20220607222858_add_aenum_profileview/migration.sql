-- CreateEnum
CREATE TYPE "ProfileView" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "view" "ProfileView" NOT NULL DEFAULT E'PUBLIC';
