-- CreateTable
CREATE TABLE "FeaturedProjects" (
    "id" TEXT NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "updationTime" TIMESTAMP(3),
    "featuredProjectsCount" INTEGER NOT NULL,
    "projectsIdList" TEXT[],

    CONSTRAINT "FeaturedProjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionCodes" (
    "id" TEXT NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "updationTime" TIMESTAMP(3),
    "trxCode" TEXT NOT NULL,
    "trxName" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "TransactionCodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "transactionFromId" TEXT NOT NULL,
    "transactionToId" TEXT NOT NULL,
    "transactionAmount" DOUBLE PRECISION NOT NULL,
    "transactionStatus" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralOfferings" (
    "id" TEXT NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "updationTime" TIMESTAMP(3),
    "referralName" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ReferralOfferings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "updationTime" TIMESTAMP(3),
    "roleName" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminPanel" (
    "id" TEXT NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "updationTime" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "RoleId" TEXT NOT NULL,

    CONSTRAINT "AdminPanel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationShader" (
    "id" TEXT NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "initiatedById" TEXT NOT NULL,
    "initiatedForId" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "NotificationShader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawlRequest" (
    "id" TEXT NOT NULL,
    "processedTime" TIMESTAMP(3) NOT NULL,
    "initiatedById" TEXT NOT NULL,
    "withdrawlAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "processedById" TEXT NOT NULL,

    CONSTRAINT "WithdrawlRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionMessage" (
    "id" TEXT NOT NULL,
    "sendingTime" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "transactionFromId" TEXT NOT NULL,
    "transactionFromTo" TEXT NOT NULL,

    CONSTRAINT "TransactionMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedProjects_id_key" ON "FeaturedProjects"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionCodes_id_key" ON "TransactionCodes"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_id_key" ON "Transaction"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralOfferings_id_key" ON "ReferralOfferings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_id_key" ON "Role"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AdminPanel_id_key" ON "AdminPanel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationShader_id_key" ON "NotificationShader"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawlRequest_id_key" ON "WithdrawlRequest"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionMessage_id_key" ON "TransactionMessage"("id");
