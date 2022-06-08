/*
  Warnings:

  - You are about to drop the column `status` on the `user` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'UNVERIFIED';

-- AlterTable
ALTER TABLE "user" DROP COLUMN "status";
