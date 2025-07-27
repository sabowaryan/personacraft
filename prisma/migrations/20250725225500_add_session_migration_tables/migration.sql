/*
  Warnings:

  - You are about to drop the column `description` on the `Persona` table. All the data in the column will be lost.
  - Added the required column `age` to the `Persona` table without a default value. This is not possible if the table is not empty.
  - Added the required column `culturalData` to the `Persona` table without a default value. This is not possible if the table is not empty.
  - Added the required column `demographics` to the `Persona` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Persona` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marketingInsights` to the `Persona` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occupation` to the `Persona` table without a default value. This is not possible if the table is not empty.
  - Added the required column `psychographics` to the `Persona` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qualityScore` to the `Persona` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Persona` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Persona" DROP COLUMN "description",
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "culturalData" JSONB NOT NULL,
ADD COLUMN     "demographics" JSONB NOT NULL,
ADD COLUMN     "goals" TEXT[],
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "marketingInsights" JSONB NOT NULL,
ADD COLUMN     "occupation" TEXT NOT NULL,
ADD COLUMN     "painPoints" TEXT[],
ADD COLUMN     "psychographics" JSONB NOT NULL,
ADD COLUMN     "qualityScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'fr',
    "autoSave" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedBrief" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedBrief_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedBrief" ADD CONSTRAINT "SavedBrief_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
