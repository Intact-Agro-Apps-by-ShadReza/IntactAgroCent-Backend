/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "RegisteredMail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegisteredMail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailVerificationCode" (
    "id" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "expirationTime" INTEGER NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "emailId" TEXT NOT NULL,

    CONSTRAINT "MailVerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegisteredMail_id_key" ON "RegisteredMail"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RegisteredMail_email_key" ON "RegisteredMail"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MailVerificationCode_id_key" ON "MailVerificationCode"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MailVerificationCode_emailId_key" ON "MailVerificationCode"("emailId");

-- AddForeignKey
ALTER TABLE "MailVerificationCode" ADD CONSTRAINT "MailVerificationCode_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "RegisteredMail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
