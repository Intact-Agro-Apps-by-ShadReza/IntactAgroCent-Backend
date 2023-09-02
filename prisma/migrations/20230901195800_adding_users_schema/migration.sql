-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "bankAccountNumber" TEXT NOT NULL,
    "nidCardFrontPicLink" TEXT NOT NULL,
    "nidCardBackPicLink" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
