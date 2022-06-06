/*
  Warnings:

  - Added the required column `status` to the `comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "status" "PostStatus" NOT NULL;
