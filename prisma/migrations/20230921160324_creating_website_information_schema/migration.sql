-- CreateTable
CREATE TABLE "WebsiteInformation" (
    "id" TEXT NOT NULL,
    "websiteName" TEXT NOT NULL,
    "bigLogoLink" TEXT NOT NULL,
    "smallLogoLink" TEXT NOT NULL,
    "privacyPolicyLink" TEXT NOT NULL,
    "termsAndConditionLink" TEXT NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "updationTime" TIMESTAMP(3),

    CONSTRAINT "WebsiteInformation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteInformation_id_key" ON "WebsiteInformation"("id");
