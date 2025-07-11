import { z } from 'zod';

// Schémas de validation pour les données d'entrée
export const briefFormSchema = z.object({
  description: z
    .string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .refine(
      (val) => val.trim().length >= 10,
      'La description ne peut pas être composée uniquement d\'espaces'
    ),
  
  ageRange: z
    .string()
    .regex(/^(18-25|25-35|35-45|45-55|55-65|65\+)$/, 'Tranche d\'âge invalide'),
  
  location: z
    .string()
    .max(100, 'La localisation ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),
  
  interests: z
    .array(z.string().min(1).max(50))
    .min(1, 'Au moins un centre d\'intérêt est requis')
    .max(15, 'Maximum 15 centres d\'intérêt autorisés')
    .refine(
      (interests) => new Set(interests).size === interests.length,
      'Les centres d\'intérêt doivent être uniques'
    ),
  
  values: z
    .array(z.string().min(1).max(50))
    .min(1, 'Au moins une valeur est requise')
    .max(10, 'Maximum 10 valeurs autorisées')
    .refine(
      (values) => new Set(values).size === values.length,
      'Les valeurs doivent être uniques'
    ),
  
  generateMultiple: z.boolean().default(false)
});

// Schéma pour valider un persona complet
export const personaSchema = z.object({
  id: z.string().uuid('ID invalide'),
  name: z.string().min(2).max(100),
  age: z.number().int().min(16).max(100),
  location: z.string().min(2).max(100),
  bio: z.string().min(10).max(1000),
  values: z.array(z.string()).min(1).max(10),
  interests: z.object({
    music: z.array(z.string()).max(10),
    brands: z.array(z.string()).max(10),
    movies: z.array(z.string()).max(10),
    food: z.array(z.string()).max(10),
    books: z.array(z.string()).max(10),
    lifestyle: z.array(z.string()).max(10)
  }),
  communication: z.object({
    preferredChannels: z.array(z.string()).min(1).max(8),
    tone: z.string().min(2).max(50),
    contentTypes: z.array(z.string()).min(1).max(10),
    frequency: z.string().min(2).max(50)
  }),
  marketing: z.object({
    painPoints: z.array(z.string()).min(1).max(10),
    motivations: z.array(z.string()).min(1).max(10),
    buyingBehavior: z.string().min(10).max(500),
    influences: z.array(z.string()).min(1).max(10)
  }),
  quote: z.string().min(10).max(300),
  generatedAt: z.date(),
  sources: z.array(z.string()).min(1),
  avatar: z.string().url().optional()
});

// Schémas pour les APIs externes
export const qlooRequestSchema = z.object({
  interests: z.array(z.string()).min(1).max(20),
  demographics: z.object({
    age: z.number().int().min(16).max(100),
    location: z.string().min(2).max(100)
  }),
  categories: z.array(z.enum(['music', 'brands', 'movies', 'food', 'books', 'lifestyle']))
});

export const geminiRequestSchema = z.object({
  prompt: z.string().min(10).max(5000),
  context: z.any().optional(),
  parameters: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().min(100).max(4000).optional(),
    format: z.enum(['json', 'text']).optional()
  }).optional()
});

// Fonctions de validation
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateBriefForm(data: unknown) {
  try {
    return briefFormSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        firstError.message,
        firstError.path.join('.'),
        firstError.code
      );
    }
    throw error;
  }
}

export function validatePersona(data: unknown) {
  try {
    return personaSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        `Persona invalide: ${firstError.message}`,
        firstError.path.join('.'),
        firstError.code
      );
    }
    throw error;
  }
}

export function validateQlooRequest(data: unknown) {
  try {
    return qlooRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Requête Qloo invalide: ' + error.errors[0].message
      );
    }
    throw error;
  }
}

export function validateGeminiRequest(data: unknown) {
  try {
    return geminiRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Requête Gemini invalide: ' + error.errors[0].message
      );
    }
    throw error;
  }
}

// Validateurs spécifiques
export const emailValidator = z.string().email('Email invalide');
export const urlValidator = z.string().url('URL invalide');
export const phoneValidator = z.string().regex(
  /^(\+33|0)[1-9](\d{8})$/,
  'Numéro de téléphone français invalide'
);

// Sanitisation des données
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
    .replace(/[<>]/g, '') // Supprimer les caractères HTML dangereux
    .substring(0, 1000); // Limiter la longueur
}

export function sanitizeArray(input: string[]): string[] {
  return input
    .map(sanitizeString)
    .filter(item => item.length > 0)
    .slice(0, 20); // Limiter le nombre d'éléments
}

// Validation des fichiers d'export
export function validateExportFormat(format: string): 'pdf' | 'csv' {
  if (format !== 'pdf' && format !== 'csv') {
    throw new ValidationError('Format d\'export invalide. Utilisez "pdf" ou "csv".');
  }
  return format;
}

// Validation des paramètres d'URL
export function validatePersonaId(id: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new ValidationError('ID de persona invalide');
  }
  return id;
}

// Validation des limites de rate limiting
export function validateRateLimit(requests: number, windowMs: number): boolean {
  const maxRequests = 100; // Maximum par fenêtre
  const minWindow = 60000; // Minimum 1 minute
  
  if (requests > maxRequests) {
    throw new ValidationError(`Trop de requêtes. Maximum ${maxRequests} par fenêtre.`);
  }
  
  if (windowMs < minWindow) {
    throw new ValidationError(`Fenêtre trop courte. Minimum ${minWindow}ms.`);
  }
  
  return true;
}