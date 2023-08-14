-- AlterTable
ALTER TABLE "Currency" ALTER COLUMN "creationTime" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "creationTime" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MailVerificationCode" ALTER COLUMN "creationTime" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "creationTime" DROP DEFAULT;

-- AlterTable
ALTER TABLE "RegisteredMail" ALTER COLUMN "creationTime" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "creationTime" DROP DEFAULT;
