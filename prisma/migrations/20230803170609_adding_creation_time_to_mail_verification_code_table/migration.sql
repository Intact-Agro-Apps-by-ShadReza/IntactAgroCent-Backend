-- AlterTable
ALTER TABLE "MailVerificationCode" ADD COLUMN     "creationTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
