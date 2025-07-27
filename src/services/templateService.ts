import { BriefFormData } from '@/components/forms/BriefForm';

export interface TemplateData extends BriefFormData {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    preview: string;
    isPopular?: boolean;
    isPremium?: boolean;
    createdAt: string;
    updatedAt: string;
}

// Mock data basé sur la structure BriefFormData
const templateMocks: TemplateData[] = [
    {
        id: '1',
        name: 'E-commerce Customer',
        description: 'Persona type pour clients d\'e-commerce avec comportements d\'achat détaillés',
        category: 'E-commerce',
        tags: ['Shopping', 'Conversion', 'UX'],
        preview: 'Femme, 28-35 ans, acheteuse en ligne régulière, privilégie la qualité et les avis clients',
        isPopular: true,
        brief: 'Application e-commerce pour femmes actives de 25-40 ans, urbaines, soucieuses de la mode et cherchant des produits de qualité avec livraison rapide. Elles privilégient les marques éthiques et utilisent principalement leur smartphone pour faire leurs achats.',
        ageRange: { min: 25, max: 40 },
        location: 'France, zones urbaines',
        language: 'fr',
        personaCount: 2,
        interests: ['Mode', 'Shopping', 'Qualité', 'Marques éthiques', 'Livraison rapide'],
        values: ['Qualité', 'Éthique', 'Efficacité', 'Style'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '2',
        name: 'SaaS User',
        description: 'Template pour utilisateurs de logiciels SaaS B2B',
        category: 'SaaS',
        tags: ['B2B', 'Productivité', 'Tech'],
        preview: 'Professionnel, 30-45 ans, utilise des outils digitaux pour optimiser sa productivité',
        isPremium: true,
        brief: 'Plateforme SaaS de gestion de projet pour équipes de développement agiles de 10-50 personnes. Les utilisateurs sont des chefs de projet, développeurs et product managers cherchant à améliorer leur collaboration et leur efficacité.',
        ageRange: { min: 28, max: 50 },
        location: 'International, télétravail',
        language: 'en',
        personaCount: 3,
        interests: ['Productivité', 'Technologie', 'Gestion de projet', 'Collaboration', 'Innovation'],
        values: ['Efficacité', 'Innovation', 'Collaboration', 'Qualité', 'Simplicité'],
        createdAt: '2024-01-16T14:30:00Z',
        updatedAt: '2024-01-16T14:30:00Z'
    },
    {
        id: '3',
        name: 'Mobile App User',
        description: 'Persona pour applications mobiles grand public',
        category: 'Mobile',
        tags: ['Mobile', 'App', 'Engagement'],
        preview: 'Utilisateur mobile actif, 18-30 ans, consomme du contenu en mobilité',
        brief: 'Application mobile de divertissement pour jeunes adultes de 18-30 ans, urbains et connectés. Ils cherchent du contenu engageant, personnalisé et facilement consommable pendant leurs trajets et temps libres.',
        ageRange: { min: 18, max: 30 },
        location: 'Grandes villes françaises',
        language: 'fr',
        personaCount: 2,
        interests: ['Divertissement', 'Réseaux sociaux', 'Musique', 'Vidéos', 'Gaming'],
        values: ['Divertissement', 'Créativité', 'Liberté', 'Simplicité'],
        createdAt: '2024-01-17T09:15:00Z',
        updatedAt: '2024-01-17T09:15:00Z'
    },
    {
        id: '4',
        name: 'Healthcare Patient',
        description: 'Template pour patients dans le secteur de la santé',
        category: 'Healthcare',
        tags: ['Santé', 'Patient', 'Care'],
        preview: 'Patient soucieux de sa santé, 35-60 ans, cherche des solutions digitales fiables',
        brief: 'Application de suivi médical pour patients chroniques de 35-65 ans. Ils ont besoin d\'outils simples et fiables pour gérer leur traitement, communiquer avec leurs médecins et suivre leur état de santé.',
        ageRange: { min: 35, max: 65 },
        location: 'France, toutes régions',
        language: 'fr',
        personaCount: 2,
        interests: ['Santé et bien-être', 'Médecine', 'Famille', 'Sécurité'],
        values: ['Sécurité', 'Fiabilité', 'Simplicité', 'Respect', 'Transparence'],
        createdAt: '2024-01-18T11:45:00Z',
        updatedAt: '2024-01-18T11:45:00Z'
    },
    {
        id: '5',
        name: 'EdTech Student',
        description: 'Persona pour étudiants utilisant des plateformes éducatives',
        category: 'Education',
        tags: ['Education', 'Learning', 'Student'],
        preview: 'Étudiant motivé, 16-25 ans, apprend en ligne et cherche des méthodes efficaces',
        brief: 'Plateforme d\'apprentissage en ligne pour étudiants de 16-25 ans. Ils cherchent des cours interactifs, flexibles et adaptés à leur rythme d\'apprentissage, avec des certifications reconnues.',
        ageRange: { min: 16, max: 25 },
        location: 'France, étudiants universitaires',
        language: 'fr',
        personaCount: 3,
        interests: ['Éducation', 'Technologie', 'Développement personnel', 'Certification', 'Flexibilité'],
        values: ['Excellence', 'Innovation', 'Développement personnel', 'Efficacité'],
        createdAt: '2024-01-19T16:20:00Z',
        updatedAt: '2024-01-19T16:20:00Z'
    },
    {
        id: '6',
        name: 'FinTech User',
        description: 'Template pour utilisateurs d\'applications financières',
        category: 'Finance',
        tags: ['Finance', 'Banking', 'Investment'],
        preview: 'Professionnel financier, 25-40 ans, cherche des outils d\'investissement modernes',
        isPopular: true,
        brief: 'Application fintech pour jeunes professionnels de 25-40 ans souhaitant gérer leurs finances personnelles et investir intelligemment. Ils valorisent la transparence, la sécurité et les outils d\'analyse avancés.',
        ageRange: { min: 25, max: 40 },
        location: 'Grandes métropoles européennes',
        language: 'fr',
        personaCount: 2,
        interests: ['Finance', 'Investissement', 'Technologie', 'Épargne', 'Analyse'],
        values: ['Sécurité', 'Transparence', 'Innovation', 'Efficacité', 'Croissance'],
        createdAt: '2024-01-20T13:10:00Z',
        updatedAt: '2024-01-20T13:10:00Z'
    }
];

export class TemplateService {
    private static templates: TemplateData[] = [...templateMocks];

    // Récupérer tous les templates
    static getAllTemplates(): TemplateData[] {
        return this.templates;
    }

    // Récupérer un template par ID
    static getTemplateById(id: string): TemplateData | undefined {
        return this.templates.find(template => template.id === id);
    }

    // Filtrer les templates par catégorie
    static getTemplatesByCategory(category: string): TemplateData[] {
        if (category === 'Tous') {
            return this.templates;
        }
        return this.templates.filter(template => template.category === category);
    }

    // Rechercher des templates
    static searchTemplates(query: string): TemplateData[] {
        const searchTerm = query.toLowerCase();
        return this.templates.filter(template =>
            template.name.toLowerCase().includes(searchTerm) ||
            template.description.toLowerCase().includes(searchTerm) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            template.brief.toLowerCase().includes(searchTerm)
        );
    }

    // Récupérer les templates populaires
    static getPopularTemplates(): TemplateData[] {
        return this.templates.filter(template => template.isPopular);
    }

    // Récupérer les templates premium
    static getPremiumTemplates(): TemplateData[] {
        return this.templates.filter(template => template.isPremium);
    }

    // Récupérer les catégories disponibles
    static getCategories(): string[] {
        const uniqueCategories = new Set(this.templates.map(template => template.category));
        const categories = Array.from(uniqueCategories);
        return ['Tous', ...categories];
    }

    // Convertir un template en BriefFormData pour utilisation dans le formulaire
    static templateToBriefFormData(template: TemplateData): BriefFormData {
        return {
            brief: template.brief,
            ageRange: template.ageRange,
            location: template.location,
            language: template.language,
            personaCount: template.personaCount,
            interests: template.interests,
            values: template.values
        };
    }

    // Ajouter un nouveau template (pour usage futur)
    static addTemplate(templateData: Omit<TemplateData, 'id' | 'createdAt' | 'updatedAt'>): TemplateData {
        const newTemplate: TemplateData = {
            ...templateData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.templates.push(newTemplate);
        return newTemplate;
    }

    // Mettre à jour un template
    static updateTemplate(id: string, updates: Partial<TemplateData>): TemplateData | null {
        const index = this.templates.findIndex(template => template.id === id);
        if (index === -1) return null;

        this.templates[index] = {
            ...this.templates[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        return this.templates[index];
    }

    // Supprimer un template
    static deleteTemplate(id: string): boolean {
        const index = this.templates.findIndex(template => template.id === id);
        if (index === -1) return false;

        this.templates.splice(index, 1);
        return true;
    }
}