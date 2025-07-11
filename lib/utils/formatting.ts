import { Persona } from '../types/persona';

// Formatage des dates
export function formatDate(date: Date, format: 'short' | 'long' | 'iso' | 'relative' = 'short'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString('fr-FR');
    case 'long':
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'iso':
      return date.toISOString();
    case 'relative':
      return formatRelativeDate(date);
    default:
      return date.toLocaleDateString('fr-FR');
  }
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'À l\'instant';
  if (diffMinutes < 60) return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  
  return formatDate(date, 'short');
}

// Formatage des noms
export function formatPersonaName(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function getPersonaInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3);
}

// Formatage des listes
export function formatList(items: string[], maxItems: number = 3, separator: string = ', '): string {
  if (items.length === 0) return 'Aucun';
  if (items.length <= maxItems) return items.join(separator);
  
  const visible = items.slice(0, maxItems);
  const remaining = items.length - maxItems;
  
  return `${visible.join(separator)} et ${remaining} autre${remaining > 1 ? 's' : ''}`;
}

export function formatListWithAnd(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} et ${items[1]}`;
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  
  return `${otherItems.join(', ')} et ${lastItem}`;
}

// Formatage des âges
export function formatAge(age: number): string {
  return `${age} an${age > 1 ? 's' : ''}`;
}

export function formatAgeRange(ageRange: string): string {
  const ranges: Record<string, string> = {
    '18-25': '18 à 25 ans',
    '25-35': '25 à 35 ans',
    '35-45': '35 à 45 ans',
    '45-55': '45 à 55 ans',
    '55-65': '55 à 65 ans',
    '65+': '65 ans et plus'
  };
  
  return ranges[ageRange] || ageRange;
}

// Formatage des localisations
export function formatLocation(location: string): string {
  const parts = location.split(',').map(part => part.trim());
  if (parts.length === 1) return parts[0];
  
  // Format: "Ville, Pays"
  return parts.join(', ');
}

export function getLocationCountry(location: string): string {
  const parts = location.split(',').map(part => part.trim());
  return parts[parts.length - 1] || location;
}

export function getLocationCity(location: string): string {
  const parts = location.split(',').map(part => part.trim());
  return parts[0] || location;
}

// Formatage des textes longs
export function truncateText(text: string, maxLength: number = 100, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // Couper au dernier espace pour éviter de couper un mot
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + suffix;
  }
  
  return truncated + suffix;
}

export function formatParagraph(text: string, maxWordsPerLine: number = 15): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine: string[] = [];
  
  words.forEach(word => {
    if (currentLine.length >= maxWordsPerLine) {
      lines.push(currentLine.join(' '));
      currentLine = [word];
    } else {
      currentLine.push(word);
    }
  });
  
  if (currentLine.length > 0) {
    lines.push(currentLine.join(' '));
  }
  
  return lines;
}

// Formatage des statistiques
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  const percentage = Math.round((value / total) * 100);
  return `${percentage}%`;
}

export function formatCount(count: number, singular: string, plural?: string): string {
  const pluralForm = plural || `${singular}s`;
  return `${count} ${count <= 1 ? singular : pluralForm}`;
}

// Formatage pour l'export
export function formatPersonaForExport(persona: Persona): Record<string, string> {
  return {
    'Nom': persona.name,
    'Âge': formatAge(persona.age),
    'Localisation': formatLocation(persona.location),
    'Biographie': persona.bio,
    'Citation': `"${persona.quote}"`,
    'Valeurs': formatListWithAnd(persona.values),
    'Musique': formatList(persona.interests.music),
    'Marques': formatList(persona.interests.brands),
    'Films': formatList(persona.interests.movies),
    'Cuisine': formatList(persona.interests.food),
    'Lectures': formatList(persona.interests.books),
    'Style de vie': formatList(persona.interests.lifestyle),
    'Canaux préférés': formatListWithAnd(persona.communication.preferredChannels),
    'Ton de communication': persona.communication.tone,
    'Types de contenu': formatListWithAnd(persona.communication.contentTypes),
    'Fréquence': persona.communication.frequency,
    'Points de douleur': persona.marketing.painPoints.map(p => `• ${p}`).join('\n'),
    'Motivations': persona.marketing.motivations.map(m => `• ${m}`).join('\n'),
    'Comportement d\'achat': persona.marketing.buyingBehavior,
    'Influences': formatListWithAnd(persona.marketing.influences),
    'Date de génération': formatDate(persona.generatedAt, 'long'),
    'Sources': formatListWithAnd(persona.sources)
  };
}

// Formatage des URLs
export function formatShareableUrl(personaId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/personas/${personaId}`;
}

// Formatage des couleurs
export function getPersonaColor(index: number): string {
  const colors = [
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316'  // Orange
  ];
  
  return colors[index % colors.length];
}

// Formatage des métadonnées
export function formatMetadata(persona: Persona): string[] {
  return [
    `ID: ${persona.id.substring(0, 8)}...`,
    `Généré: ${formatDate(persona.generatedAt, 'relative')}`,
    `Sources: ${persona.sources.length}`,
    `Intérêts: ${Object.values(persona.interests).flat().length}`
  ];
}

// Utilitaires de formatage pour les templates
export function createPersonaSummary(persona: Persona): string {
  const age = formatAge(persona.age);
  const location = getLocationCity(persona.location);
  const topValues = persona.values.slice(0, 2);
  const topInterests = [
    ...persona.interests.music.slice(0, 1),
    ...persona.interests.lifestyle.slice(0, 1)
  ];
  
  return `${persona.name}, ${age}, ${location}. Valorise ${formatListWithAnd(topValues)}. S'intéresse à ${formatListWithAnd(topInterests)}.`;
}

export function createPersonaHashtags(persona: Persona): string[] {
  const hashtags: string[] = [];
  
  // Hashtags basés sur les valeurs
  persona.values.forEach(value => {
    hashtags.push(`#${value.replace(/\s+/g, '').toLowerCase()}`);
  });
  
  // Hashtags basés sur les intérêts
  const allInterests = Object.values(persona.interests).flat();
  allInterests.slice(0, 3).forEach(interest => {
    hashtags.push(`#${interest.replace(/\s+/g, '').toLowerCase()}`);
  });
  
  // Hashtags génériques
  hashtags.push('#persona', '#marketing', '#personacraft');
  
  return hashtags.slice(0, 8); // Limiter à 8 hashtags
}