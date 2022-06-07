/*
  Warnings:

  - You are about to drop the `like_on_comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `like_on_post` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Source" AS ENUM ('POST', 'COMMENT');

-- DropForeignKey
ALTER TABLE "like_on_comment" DROP CONSTRAINT "like_on_comment_commentId_fkey";

-- DropForeignKey
ALTER TABLE "like_on_comment" DROP CONSTRAINT "like_on_comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "like_on_post" DROP CONSTRAINT "like_on_post_postId_fkey";

-- DropForeignKey
ALTER TABLE "like_on_post" DROP CONSTRAINT "like_on_post_userId_fkey";

-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "totalDislikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalLikes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "totalDislikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalLikes" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "like_on_comment";

-- DropTable
DROP TABLE "like_on_post";

-- CreateTable
CREATE TABLE "like" (
    "postOrCommentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "Source" NOT NULL,

    CONSTRAINT "like_pkey" PRIMARY KEY ("userId","postOrCommentId")
);

-- CreateTable
CREATE TABLE "dislike" (
    "postOrCommentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "Source" NOT NULL,

    CONSTRAINT "dislike_pkey" PRIMARY KEY ("userId","postOrCommentId")
);

-- AddForeignKey
ALTER TABLE "like" ADD CONSTRAINT "like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dislike" ADD CONSTRAINT "dislike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
