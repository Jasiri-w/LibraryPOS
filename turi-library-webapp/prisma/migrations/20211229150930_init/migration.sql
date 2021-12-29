-- CreateTable
CREATE TABLE "Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "boarding_house" TEXT NOT NULL,
    "year_group" TEXT NOT NULL,
    "gender" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Exchange" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "book_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "checkout_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "return_date" DATETIME NOT NULL,
    CONSTRAINT "Exchange_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exchange_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "barcode" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "media" TEXT NOT NULL,
    "URL" TEXT NOT NULL,
    "returned" BOOLEAN NOT NULL DEFAULT true
);
