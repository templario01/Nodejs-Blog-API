/*
  Warnings:

  - Added the required column `status` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PUBLISHED', 'DRAFT');

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "status" "PostStatus" NOT NULL;
