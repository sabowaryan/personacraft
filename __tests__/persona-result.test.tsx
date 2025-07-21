import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonaResult } from '@/components/persona-result/persona-result';

// Mock des dépendances
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
}));

// Données de test
const mockPersona = {
  id: 'test-persona-1',
  name: 'Marie Dupont',
  age: 32,
  location: 'Paris, France',
  bio: 'Marie est une professionnelle du marketing digital...',
  quote: 'La qualité avant la quantité, toujours.',
  avatar: null,
  generatedAt: new Date().toISOString(),
  values: [
    { name: 'Authenticité', score: 85, description: 'Être vrai et transparent' },
    { name: 'Innovation', score: 75, description: 'Rechercher de nouvelles solutions' },
  ],
  interests: {
    technology: [
      { name: 'Applications mobiles', score: 90 },
      { name: 'Intelligence artificielle', score: 80 },
    ],
    books: [
      { name: 'Développement personnel', score: 85 },
    ],
  },
  communication: {
    channels: [
      { name: 'email', score: 90, description: 'Préfère les communications détaillées' },
      { name: 'linkedin', score: 80, description: 'Pour le réseautage professionnel' },
    ],
    tone: ['professional', 'friendly'],
    frequency: 'weekly',
    contentPreferences: [
      { type: 'Articles de blog', score: 85 },
      { type: 'Vidéos courtes', score: 75 },
    ],
  },
  marketing: {
    painPoints: [
      { name: 'Manque de temps', description: 'Difficulté à gérer toutes les tâches' },
      { name: 'Surcharge d\'information', description: 'Trop de contenu à filtrer' },
    ],
    motivations: [
      { name: 'Efficacité', description: 'Optimiser son temps et ses ressources' },
      { name: 'Développement professionnel', description: 'Améliorer ses compétences' },
    ],
    purchaseBehavior: {
      researchLevel: 85,
      priceConsciousness: 70,
      brandLoyalty: 65,
      decisionSpeed: 'moderate',
    },
    influenceSources: [
      { type: 'experts', name: 'Avis d\'experts', score: 90 },
      { type: 'reviews', name: 'Évaluations en ligne', score: 85 },
    ],
  },
  sources: ['interview-1', 'survey-2'],
};

describe('PersonaResult Component', () => {
  it('renders the persona name and basic information', () => {
    render(<PersonaResult persona={mockPersona} />);
    
    expect(screen.getByText('Marie Dupont')).toBeInTheDocument();
    expect(screen.getByText('32 ans • Paris, France')).toBeInTheDocument();
  });

  it('displays the persona quote when available', () => {
    render(<PersonaResult persona={mockPersona} />);
    
    expect(screen.getByText('La qualité avant la quantité, toujours.')).toBeInTheDocument();
  });

  it('renders all tabs correctly', () => {
    render(<PersonaResult persona={mockPersona} />);
    
    expect(screen.getByRole('tab', { name: 'Profil' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Intérêts' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Communication' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Marketing' })).toBeInTheDocument();
  });

  it('switches tabs when clicked', () => {
    render(<PersonaResult persona={mockPersona} />);
    
    // Le contenu de l'onglet Profil devrait être visible par défaut
    expect(screen.getByText('Biographie')).toBeInTheDocument();
    
    // Cliquer sur l'onglet Intérêts
    fireEvent.click(screen.getByRole('tab', { name: 'Intérêts' }));
    
    // Le contenu de l'onglet Intérêts devrait maintenant être visible
    expect(screen.getByText('Centres d\'intérêt')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const mockOnBack = jest.fn();
    render(<PersonaResult persona={mockPersona} onBack={mockOnBack} />);
    
    const backButton = screen.getByRole('button', { name: '' }); // Le bouton retour n'a que l'icône
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('displays the generation date in the footer', () => {
    render(<PersonaResult persona={mockPersona} />);
    
    const dateString = new Date(mockPersona.generatedAt).toLocaleDateString();
    expect(screen.getByText(`Persona généré le ${dateString}`)).toBeInTheDocument();
  });

  it('displays sources count when available', () => {
    render(<PersonaResult persona={mockPersona} />);
    
    expect(screen.getByText('Basé sur 2 source(s)')).toBeInTheDocument();
  });
});