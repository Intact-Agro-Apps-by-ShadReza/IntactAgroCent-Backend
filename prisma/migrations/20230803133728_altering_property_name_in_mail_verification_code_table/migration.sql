/*
  Warnings:

  - You are about to drop the column `expirationTime` on the `MailVerificationCode` table. All the data in the column will be lost.
  - Added the required column `expirationTimeInMinutes` to the `MailVerificationCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MailVerificationCode" DROP COLUMN "expirationTime",
ADD COLUMN     "expirationTimeInMinutes" INTEGER NOT NULL;
