/*
  Warnings:

  - The primary key for the `comment_report` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `postReport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId]` on the table `like_on_comment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `like_on_post` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `comment_report` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `reason` to the `comment_report` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `postReport` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `reason` to the `postReport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'FAKE_NEWS', 'LANGUAGE_THAT_INSTIGATES_HATE', 'BULLYING', 'APOLOGY_OF_TERRORISM', 'DISLIKE', 'JUST_DONT_LIKE', 'OTHER_PROBLEM');

-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "comment_report" DROP CONSTRAINT "comment_report_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "reason" "ReportReason" NOT NULL,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "comment_report_pkey" PRIMARY KEY ("userId", "commentId", "id");

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "postReport" DROP CONSTRAINT "postReport_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "reason" "ReportReason" NOT NULL,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "postReport_pkey" PRIMARY KEY ("userId", "postId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "like_on_comment_userId_key" ON "like_on_comment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "like_on_post_userId_key" ON "like_on_post"("userId");
