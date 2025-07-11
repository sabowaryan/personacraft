import { Persona } from '../types/persona';

export async function exportToPDF(persona: Persona): Promise<void> {
  // Simulate PDF generation
  const content = `
PERSONA: ${persona.name}

Âge: ${persona.age} ans
Localisation: ${persona.location}

Bio: ${persona.bio}

Valeurs: ${persona.values.join(', ')}

Quote: "${persona.quote}"

Intérêts:
- Musique: ${persona.interests.music.join(', ')}
- Marques: ${persona.interests.brands.join(', ')}
- Films: ${persona.interests.movies.join(', ')}
- Cuisine: ${persona.interests.food.join(', ')}
- Lectures: ${persona.interests.books.join(', ')}
- Lifestyle: ${persona.interests.lifestyle.join(', ')}

Communication:
- Canaux préférés: ${persona.communication.preferredChannels.join(', ')}
- Ton: ${persona.communication.tone}
- Types de contenu: ${persona.communication.contentTypes.join(', ')}
- Fréquence: ${persona.communication.frequency}

Marketing:
- Points de douleur: ${persona.marketing.painPoints.join(', ')}
- Motivations: ${persona.marketing.motivations.join(', ')}
- Comportement d'achat: ${persona.marketing.buyingBehavior}
- Influences: ${persona.marketing.influences.join(', ')}

Généré le: ${persona.generatedAt.toLocaleDateString()}
Sources: ${persona.sources.join(', ')}
  `;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${persona.name.replace(/\s+/g, '_')}_persona.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportToCSV(personas: Persona[]): Promise<void> {
  const headers = [
    'Name', 'Age', 'Location', 'Bio', 'Values', 'Quote',
    'Music', 'Brands', 'Movies', 'Food', 'Books', 'Lifestyle',
    'Preferred Channels', 'Tone', 'Content Types', 'Frequency',
    'Pain Points', 'Motivations', 'Buying Behavior', 'Influences',
    'Generated At', 'Sources'
  ];

  const rows = personas.map(persona => [
    persona.name,
    persona.age.toString(),
    persona.location,
    persona.bio,
    persona.values.join('; '),
    persona.quote,
    persona.interests.music.join('; '),
    persona.interests.brands.join('; '),
    persona.interests.movies.join('; '),
    persona.interests.food.join('; '),
    persona.interests.books.join('; '),
    persona.interests.lifestyle.join('; '),
    persona.communication.preferredChannels.join('; '),
    persona.communication.tone,
    persona.communication.contentTypes.join('; '),
    persona.communication.frequency,
    persona.marketing.painPoints.join('; '),
    persona.marketing.motivations.join('; '),
    persona.marketing.buyingBehavior,
    persona.marketing.influences.join('; '),
    persona.generatedAt.toISOString(),
    persona.sources.join('; ')
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `personas_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}