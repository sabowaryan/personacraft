-- Migration to add enhanced metadata columns to Persona table
-- This migration adds support for generation metadata, validation metadata, and related fields

-- Add new metadata columns to Persona table
ALTER TABLE "Persona" ADD COLUMN "generationMetadata" JSONB;
ALTER TABLE "Persona" ADD COLUMN "validationMetadata" JSONB;
ALTER TABLE "Persona" ADD COLUMN "culturalDataSource" VARCHAR(50) DEFAULT 'unknown';
ALTER TABLE "Persona" ADD COLUMN "templateUsed" VARCHAR(100);
ALTER TABLE "Persona" ADD COLUMN "processingTime" INTEGER;