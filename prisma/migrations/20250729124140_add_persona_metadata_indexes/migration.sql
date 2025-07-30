-- Migration to add indexes for enhanced persona metadata
-- This migration adds indexes for efficient filtering and sorting on the new metadata columns

-- Add indexes for efficient filtering and sorting
CREATE INDEX "idx_persona_generation_source" ON "Persona" USING GIN ((generationMetadata->>'source'));
CREATE INDEX "idx_persona_validation_score" ON "Persona" ((CAST(validationMetadata->>'validationScore' AS INTEGER)));
CREATE INDEX "idx_persona_cultural_source" ON "Persona" ("culturalDataSource");
CREATE INDEX "idx_persona_template_used" ON "Persona" ("templateUsed");
CREATE INDEX "idx_persona_processing_time" ON "Persona" ("processingTime");

-- Composite indexes for common query patterns
CREATE INDEX "idx_persona_source_score" ON "Persona" 
  USING BTREE ((generationMetadata->>'source'), "qualityScore" DESC);

CREATE INDEX "idx_persona_validation_template" ON "Persona" 
  USING BTREE ((validationMetadata->>'templateName'), (CAST(validationMetadata->>'validationScore' AS INTEGER)));

-- Index for filtering by generation method and validation score
CREATE INDEX "idx_persona_metadata_filters" ON "Persona" 
  USING BTREE ("culturalDataSource", (generationMetadata->>'source'), (CAST(validationMetadata->>'validationScore' AS INTEGER)));