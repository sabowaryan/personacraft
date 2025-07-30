import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from './route';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    persona: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
    }
  }
}));

vi.mock('@/lib/auth-utils', () => ({
  getAuthenticatedUser: vi.fn()
}));

vi.mock('@/lib/utils/persona-normalization', () => ({
  normalizePersona: vi.fn(),
  calculateCulturalRichness: vi.fn()
}));

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { normalizePersona, calculateCulturalRichness } from '@/lib/utils/persona-normalization';

describe('Persona Detail API', () => {
  const mockUser = { id: 'user-123' };
  const mockPersonaId = 'persona-123';
  
  const mockRawPersona = {
    id: mockPersonaId,
    userId: mockUser.id,
    name: 'Test Persona',
    age: 30,
    occupation: 'Developer',
    location: 'Paris',
    bio: 'Test bio',
    quote: 'Test quote',
    demographics: {},
    psychographics: {},
    culturalData: { music: ['Rock'], brands: ['Apple'] },
    painPoints: ['Time management'],
    goals: ['Career growth'],
    marketingInsights: {},
    qualityScore: 85,
    createdAt: '2024-01-01T00:00:00Z',
    generationMetadata: {
      source: 'qloo-first',
      method: 'enhanced',
      culturalConstraintsUsed: ['music', 'brands'],
      processingTime: 5000,
      qlooDataUsed: true,
      generatedAt: '2024-01-01T00:00:00Z'
    },
    validationMetadata: {
      templateName: 'qloo-first-simple-persona',
      validationScore: 90,
      validationDetails: [],
      failedRules: [],
      passedRules: ['name', 'age', 'occupation'],
      validationTime: 1000,
      validatedAt: '2024-01-01T00:00:00Z',
      overallStatus: 'passed',
      categoryScores: {
        format: 95,
        content: 90,
        cultural: 85,
        demographic: 90
      }
    },
    templateUsed: 'qloo-first-simple-persona',
    processingTime: 5000
  };

  const mockNormalizedPersona = {
    ...mockRawPersona,
    culturalRichness: 'medium' as const,
    qualityLevel: 'good' as const,
    isLegacy: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthenticatedUser as any).mockResolvedValue(mockUser);
    (normalizePersona as any).mockReturnValue(mockNormalizedPersona);
    (calculateCulturalRichness as any).mockReturnValue('medium');
  });

  describe('GET /api/personas/[id]', () => {
    it('should return persona with basic data when no query params', async () => {
      (prisma.persona.findFirst as any).mockResolvedValue(mockRawPersona);

      const request = new NextRequest('http://localhost/api/personas/persona-123');
      const params = Promise.resolve({ id: mockPersonaId });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.persona).toEqual(expect.objectContaining({
        ...mockNormalizedPersona,
        culturalDataVisualization: expect.any(Object),
        legacyStatus: expect.any(Object)
      }));
      expect(data.relatedPersonas).toBeUndefined();
      expect(data.comparisonData).toBeUndefined();
    });

    it('should include related personas when requested', async () => {
      const mockRelatedPersonas = [
        { ...mockRawPersona, id: 'related-1', name: 'Related Persona 1' },
        { ...mockRawPersona, id: 'related-2', name: 'Related Persona 2' }
      ];

      (prisma.persona.findFirst as any).mockResolvedValue(mockRawPersona);
      (prisma.persona.findMany as any).mockResolvedValue(mockRelatedPersonas);

      const request = new NextRequest('http://localhost/api/personas/persona-123?includeRelated=true');
      const params = Promise.resolve({ id: mockPersonaId });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.relatedPersonas).toHaveLength(2);
    });

    it('should include comparison data when requested', async () => {
      const mockAllPersonas = [
        mockRawPersona,
        { ...mockRawPersona, id: 'other-1', qualityScore: 75 },
        { ...mockRawPersona, id: 'other-2', qualityScore: 95 }
      ];

      (prisma.persona.findFirst as any).mockResolvedValue(mockRawPersona);
      (prisma.persona.findMany as any).mockResolvedValue(mockAllPersonas);

      const request = new NextRequest('http://localhost/api/personas/persona-123?includeComparison=true');
      const params = Promise.resolve({ id: mockPersonaId });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.comparisonData).toBeDefined();
      expect(data.comparisonData.averageScores).toBeDefined();
      expect(data.comparisonData.targetPersonaRanking).toBeDefined();
      expect(data.comparisonData.improvementSuggestions).toBeDefined();
      expect(data.comparisonData.migrationRecommendations).toEqual(expect.any(Array));
    });

    it('should return 404 when persona not found', async () => {
      (prisma.persona.findFirst as any).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/personas/nonexistent');
      const params = Promise.resolve({ id: 'nonexistent' });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Persona non trouvé');
    });

    it('should return 401 when user not authenticated', async () => {
      (getAuthenticatedUser as any).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/personas/persona-123');
      const params = Promise.resolve({ id: mockPersonaId });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Non autorisé');
    });

    it('should handle auth timeout gracefully', async () => {
      (getAuthenticatedUser as any).mockRejectedValue(new Error('Auth timeout'));

      const request = new NextRequest('http://localhost/api/personas/persona-123');
      const params = Promise.resolve({ id: mockPersonaId });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(408);
      expect(data.error).toBe('Timeout d\'authentification');
    });

    it('should include enhanced cultural data visualization', async () => {
      (prisma.persona.findFirst as any).mockResolvedValue(mockRawPersona);

      const request = new NextRequest('http://localhost/api/personas/persona-123');
      const params = Promise.resolve({ id: mockPersonaId });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.persona.culturalDataVisualization).toBeDefined();
      expect(data.persona.culturalDataVisualization.categories).toBeDefined();
      expect(data.persona.culturalDataVisualization.richness).toBeDefined();
      expect(data.persona.culturalDataVisualization.sourceIndicator).toBeDefined();
      expect(data.persona.culturalDataVisualization.totalItems).toBeDefined();
    });

    it('should include legacy status information', async () => {
      (prisma.persona.findFirst as any).mockResolvedValue(mockRawPersona);

      const request = new NextRequest('http://localhost/api/personas/persona-123');
      const params = Promise.resolve({ id: mockPersonaId });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.persona.legacyStatus).toBeDefined();
      expect(data.persona.legacyStatus.isLegacy).toBeDefined();
      expect(data.persona.legacyStatus.legacyType).toBeDefined();
      expect(data.persona.legacyStatus.indicator).toBeDefined();
      expect(data.persona.legacyStatus.description).toBeDefined();
    });

    it('should handle legacy persona without metadata', async () => {
      const legacyPersona = {
        ...mockRawPersona,
        generationMetadata: null,
        validationMetadata: null,
        templateUsed: 'legacy'
      };

      (prisma.persona.findFirst as any).mockResolvedValue(legacyPersona);
      (normalizePersona as any).mockReturnValue({
        ...mockNormalizedPersona,
        generationMetadata: undefined,
        validationMetadata: undefined,
        isLegacy: true
      });

      const request = new NextRequest('http://localhost/api/personas/persona-123');
      const params = Promise.resolve({ id: mockPersonaId });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.persona.legacyStatus.isLegacy).toBe(true);
      expect(data.persona.legacyStatus.legacyType).toBe('full-legacy');
      expect(data.persona.legacyStatus.migrationSuggestion).toContain('Régénérer avec Qloo First');
    });
  });

  describe('PUT /api/personas/[id]', () => {
    it('should update persona with enhanced metadata', async () => {
      const updateData = {
        name: 'Updated Persona',
        age: 35,
        generationMetadata: {
          source: 'qloo-first',
          method: 'updated',
          culturalConstraintsUsed: ['music'],
          processingTime: 3000,
          qlooDataUsed: true,
          generatedAt: '2024-01-02T00:00:00Z'
        }
      };

      (prisma.persona.findFirst as any).mockResolvedValue(mockRawPersona);
      (prisma.persona.update as any).mockResolvedValue({ ...mockRawPersona, ...updateData });
      (prisma.persona.findUnique as any).mockResolvedValue({ ...mockRawPersona, ...updateData });

      const request = new NextRequest('http://localhost/api/personas/persona-123', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      const params = Promise.resolve({ id: mockPersonaId });
      
      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.persona.update).toHaveBeenCalledWith({
        where: { id: mockPersonaId },
        data: expect.objectContaining({
          name: 'Updated Persona',
          age: 35,
          generationMetadata: updateData.generationMetadata
        })
      });
    });

    it('should return 404 when updating non-existent persona', async () => {
      (prisma.persona.findFirst as any).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/personas/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' })
      });
      const params = Promise.resolve({ id: 'nonexistent' });
      
      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Persona non trouvé');
    });
  });

  describe('DELETE /api/personas/[id]', () => {
    it('should delete persona successfully', async () => {
      (prisma.persona.deleteMany as any).mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost/api/personas/persona-123', {
        method: 'DELETE'
      });
      const params = Promise.resolve({ id: mockPersonaId });
      
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Persona supprimé avec succès');
      expect(prisma.persona.deleteMany).toHaveBeenCalledWith({
        where: {
          id: mockPersonaId,
          userId: mockUser.id
        }
      });
    });

    it('should return 404 when deleting non-existent persona', async () => {
      (prisma.persona.deleteMany as any).mockResolvedValue({ count: 0 });

      const request = new NextRequest('http://localhost/api/personas/nonexistent', {
        method: 'DELETE'
      });
      const params = Promise.resolve({ id: 'nonexistent' });
      
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Persona non trouvé');
    });
  });
});