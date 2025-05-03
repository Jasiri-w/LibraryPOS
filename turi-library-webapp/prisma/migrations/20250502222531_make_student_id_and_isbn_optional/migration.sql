/*
  Warnings:

  - Added the required column `author` to the `BookRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `olid` to the `BookRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `BookRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BookRequest" ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "olid" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Pending';
