/*
  Warnings:

  - You are about to drop the column `book_id` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `book_id` on the `Return` table. All the data in the column will be lost.
  - Added the required column `copy_id` to the `Checkout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `copy_id` to the `Return` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Checkout" DROP CONSTRAINT "Checkout_book_id_fkey";

-- DropForeignKey
ALTER TABLE "Return" DROP CONSTRAINT "Return_book_id_fkey";

-- AlterTable
ALTER TABLE "Checkout" DROP COLUMN "book_id",
ADD COLUMN     "copy_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Return" DROP COLUMN "book_id",
ADD COLUMN     "copy_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_copy_id_fkey" FOREIGN KEY ("copy_id") REFERENCES "BookCopy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_copy_id_fkey" FOREIGN KEY ("copy_id") REFERENCES "BookCopy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
