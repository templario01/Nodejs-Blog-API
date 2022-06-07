/*
  Warnings:

  - You are about to drop the `dislike` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `reactionType` to the `like` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'DISLIKE', 'UNSPECIFIED');

-- DropForeignKey
ALTER TABLE "dislike" DROP CONSTRAINT "dislike_userId_fkey";

-- AlterTable
ALTER TABLE "like" ADD COLUMN     "reactionType" "ReactionType" NOT NULL;

-- DropTable
DROP TABLE "dislike";
