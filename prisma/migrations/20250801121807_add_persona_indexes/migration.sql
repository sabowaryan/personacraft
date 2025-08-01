-- AlterTable
ALTER TABLE "Persona" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "quote" TEXT,
ADD COLUMN     "socialMediaInsights" JSONB;

-- CreateIndex
CREATE INDEX "idx_persona_cultural_source" ON "Persona"("culturalDataSource");

-- CreateIndex
CREATE INDEX "idx_persona_template_used" ON "Persona"("templateUsed");

-- CreateIndex
CREATE INDEX "idx_persona_processing_time" ON "Persona"("processingTime");
