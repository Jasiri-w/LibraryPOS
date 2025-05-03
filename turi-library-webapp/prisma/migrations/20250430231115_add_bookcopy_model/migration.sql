/*
  Warnings:

  - You are about to drop the column `URL` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `barcode` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `class` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `media` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `returned` on the `Book` table. All the data in the column will be lost.
  - Added the required column `format` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isbn` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "URL",
DROP COLUMN "barcode",
DROP COLUMN "class",
DROP COLUMN "media",
DROP COLUMN "returned",
ADD COLUMN     "format" TEXT NOT NULL,
ADD COLUMN     "isbn" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BookCopy" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "barcode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "location" TEXT,

    CONSTRAINT "BookCopy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookCopy_barcode_key" ON "BookCopy"("barcode");

-- AddForeignKey
ALTER TABLE "BookCopy" ADD CONSTRAINT "BookCopy_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
