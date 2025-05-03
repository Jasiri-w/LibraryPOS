-- CreateTable
CREATE TABLE "BookRequest" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER,
    "isbn" TEXT,
    "status" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BookRequest" ADD CONSTRAINT "BookRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
