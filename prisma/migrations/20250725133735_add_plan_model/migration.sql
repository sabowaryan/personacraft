-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyPrice" TEXT NOT NULL,
    "annualPrice" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT[],
    "cta" TEXT NOT NULL,
    "ctaLink" TEXT NOT NULL,
    "popular" BOOLEAN NOT NULL,
    "color" TEXT NOT NULL,
    "personasLimit" INTEGER,
    "exports" TEXT[],
    "support" TEXT NOT NULL,
    "apiAccess" BOOLEAN NOT NULL,
    "culturalInsights" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");
