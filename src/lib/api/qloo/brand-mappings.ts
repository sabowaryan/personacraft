import { Persona } from '@/types';

export interface BrandInfluence {
    brand: string;
    category: string;
    platforms: string[];
    relevanceScore: number;
}

/**
 * Mapping des marques vers leurs plateformes sociales principales
 */
export function getBrandSocialPlatforms(brand: string): string[] {
    const brandToSocialMap: { [key: string]: string[] } = {
        // Tech brands
        'Apple': ['Twitter', 'YouTube', 'Instagram'],
        'Google': ['YouTube', 'Twitter', 'LinkedIn'],
        'Microsoft': ['LinkedIn', 'Twitter', 'YouTube'],
        'Tesla': ['Twitter', 'YouTube', 'Instagram'],
        'Meta': ['Instagram', 'Facebook', 'Twitter'],
        'Amazon': ['Twitter', 'Instagram', 'YouTube'],
        'Samsung': ['Instagram', 'Twitter', 'YouTube'],
        'Sony': ['Instagram', 'YouTube', 'Twitter'],
        'Intel': ['LinkedIn', 'Twitter', 'YouTube'],
        'Adobe': ['Instagram', 'LinkedIn', 'YouTube'],

        // Fashion & Lifestyle
        'Nike': ['Instagram', 'TikTok', 'Twitter', 'YouTube'],
        'Adidas': ['Instagram', 'TikTok', 'Twitter'],
        'Zara': ['Instagram', 'Pinterest', 'TikTok'],
        'H&M': ['Instagram', 'TikTok', 'Pinterest'],
        'Louis Vuitton': ['Instagram', 'Pinterest', 'YouTube'],
        'Gucci': ['Instagram', 'Pinterest', 'TikTok'],
        'Chanel': ['Instagram', 'Pinterest', 'YouTube'],
        'Prada': ['Instagram', 'Pinterest'],
        'Versace': ['Instagram', 'Pinterest', 'TikTok'],
        'Balenciaga': ['Instagram', 'TikTok'],
        'Supreme': ['Instagram', 'Twitter'],
        'Off-White': ['Instagram', 'Twitter'],
        'Stone Island': ['Instagram'],
        'Patagonia': ['Instagram', 'YouTube', 'Twitter'],
        'The North Face': ['Instagram', 'YouTube', 'TikTok'],

        // Beauty & Cosmetics
        'Sephora': ['Instagram', 'TikTok', 'YouTube', 'Pinterest'],
        'L\'Oréal': ['Instagram', 'YouTube', 'TikTok'],
        'MAC': ['Instagram', 'YouTube', 'TikTok'],
        'Maybelline': ['Instagram', 'TikTok', 'YouTube'],
        'Urban Decay': ['Instagram', 'YouTube', 'TikTok'],
        'Fenty Beauty': ['Instagram', 'TikTok', 'YouTube'],
        'Glossier': ['Instagram', 'TikTok'],
        'Charlotte Tilbury': ['Instagram', 'YouTube', 'Pinterest'],
        'Rare Beauty': ['Instagram', 'TikTok', 'YouTube'],
        'Dior': ['Instagram', 'Pinterest', 'YouTube'],

        // Entertainment & Media
        'Netflix': ['Instagram', 'Twitter', 'TikTok', 'YouTube'],
        'Disney': ['Instagram', 'YouTube', 'TikTok', 'Facebook'],
        'Spotify': ['Instagram', 'Twitter', 'TikTok'],
        'HBO': ['Instagram', 'Twitter', 'YouTube'],
        'Amazon Prime': ['Instagram', 'Twitter', 'YouTube'],
        'Hulu': ['Instagram', 'Twitter', 'TikTok'],
        'Warner Bros': ['Instagram', 'Twitter', 'YouTube'],
        'Universal': ['Instagram', 'Twitter', 'YouTube'],
        'Marvel': ['Instagram', 'Twitter', 'YouTube', 'TikTok'],
        'DC': ['Instagram', 'Twitter', 'YouTube'],

        // Food & Beverage
        'Starbucks': ['Instagram', 'TikTok', 'Twitter'],
        'McDonald\'s': ['Instagram', 'TikTok', 'Twitter', 'Facebook'],
        'Coca-Cola': ['Instagram', 'Facebook', 'Twitter', 'YouTube'],
        'Pepsi': ['Instagram', 'TikTok', 'Twitter', 'YouTube'],
        'KFC': ['Instagram', 'TikTok', 'Twitter'],
        'Burger King': ['Instagram', 'TikTok', 'Twitter'],
        'Subway': ['Instagram', 'Facebook', 'Twitter'],
        'Domino\'s': ['Instagram', 'TikTok', 'Twitter'],
        'Pizza Hut': ['Instagram', 'TikTok', 'Facebook'],
        'Red Bull': ['Instagram', 'YouTube', 'TikTok', 'Twitter'],

        // Automotive
        'BMW': ['Instagram', 'YouTube', 'Twitter'],
        'Mercedes-Benz': ['Instagram', 'YouTube', 'Twitter'],
        'Audi': ['Instagram', 'YouTube', 'Twitter'],
        'Porsche': ['Instagram', 'YouTube', 'Twitter'],
        'Ferrari': ['Instagram', 'YouTube', 'Twitter'],
        'Lamborghini': ['Instagram', 'YouTube', 'TikTok'],
        'Ford': ['Instagram', 'YouTube', 'Twitter', 'Facebook'],
        'Toyota': ['Instagram', 'YouTube', 'Twitter'],
        'Honda': ['Instagram', 'YouTube', 'Twitter'],
        'Volkswagen': ['Instagram', 'YouTube', 'Twitter'],

        // Sports & Fitness
        'Reebok': ['Instagram', 'TikTok', 'Twitter'],
        'Under Armour': ['Instagram', 'YouTube', 'Twitter'],
        'Puma': ['Instagram', 'TikTok', 'Twitter'],
        'New Balance': ['Instagram', 'Twitter'],
        'Converse': ['Instagram', 'TikTok', 'Twitter'],
        'Vans': ['Instagram', 'TikTok', 'YouTube'],
        'Gymshark': ['Instagram', 'TikTok', 'YouTube'],
        'Lululemon': ['Instagram', 'TikTok'],

        // Luxury & Watches
        'Rolex': ['Instagram', 'YouTube'],
        'Omega': ['Instagram', 'YouTube', 'Twitter'],
        'Cartier': ['Instagram', 'Pinterest'],
        'Tiffany & Co.': ['Instagram', 'Pinterest'],
        'Hermès': ['Instagram', 'Pinterest'],

        // Gaming
        'PlayStation': ['Instagram', 'Twitter', 'YouTube', 'TikTok'],
        'Xbox': ['Instagram', 'Twitter', 'YouTube', 'TikTok'],
        'Nintendo': ['Instagram', 'Twitter', 'YouTube'],
        'Steam': ['Twitter', 'YouTube'],
        'Epic Games': ['Twitter', 'Instagram', 'YouTube'],
        'Riot Games': ['Twitter', 'Instagram', 'YouTube', 'TikTok'],

        // Airlines & Travel
        'Air France': ['Instagram', 'Twitter', 'Facebook'],
        'Emirates': ['Instagram', 'YouTube', 'Twitter'],
        'Lufthansa': ['Instagram', 'Twitter', 'LinkedIn'],
        'British Airways': ['Instagram', 'Twitter'],
        'Airbnb': ['Instagram', 'Pinterest', 'Twitter'],
        'Booking.com': ['Instagram', 'Facebook', 'Twitter'],

        // Retail
       
        'Target': ['Instagram', 'TikTok', 'Pinterest'],
        'Walmart': ['Instagram', 'Facebook', 'Twitter'],
        'IKEA': ['Instagram', 'Pinterest', 'YouTube', 'TikTok'],
        'Best Buy': ['Instagram', 'Twitter', 'YouTube']
    };

    return brandToSocialMap[brand] || ['Instagram', 'Twitter'];
}

/**
 * Catégorise une marque selon son secteur d'activité
 */
export function categorizeBrand(brand: string): string {
    const brandLower = brand.toLowerCase();

    // Technology
    if (['apple', 'google', 'microsoft', 'tesla', 'meta', 'amazon', 'samsung', 'sony', 'intel', 'adobe'].some(tech => brandLower.includes(tech))) {
        return 'Technology';
    }

    // Fashion & Lifestyle
    if (['nike', 'adidas', 'zara', 'h&m', 'louis vuitton', 'gucci', 'chanel', 'prada', 'versace', 'balenciaga', 'supreme', 'off-white', 'stone island', 'patagonia', 'the north face'].some(fashion => brandLower.includes(fashion))) {
        return 'Fashion & Lifestyle';
    }

    // Beauty & Cosmetics
    if (['sephora', 'l\'oréal', 'mac', 'maybelline', 'urban decay', 'fenty beauty', 'glossier', 'charlotte tilbury', 'rare beauty', 'dior'].some(beauty => brandLower.includes(beauty))) {
        return 'Beauty & Cosmetics';
    }

    // Entertainment
    if (['netflix', 'disney', 'spotify', 'hbo', 'amazon prime', 'hulu', 'warner bros', 'universal', 'marvel', 'dc'].some(ent => brandLower.includes(ent))) {
        return 'Entertainment';
    }

    // Food & Beverage
    if (['starbucks', 'mcdonald\'s', 'coca-cola', 'pepsi', 'kfc', 'burger king', 'subway', 'domino\'s', 'pizza hut', 'red bull'].some(food => brandLower.includes(food))) {
        return 'Food & Beverage';
    }

    // Automotive
    if (['bmw', 'mercedes-benz', 'audi', 'porsche', 'ferrari', 'lamborghini', 'ford', 'toyota', 'honda', 'volkswagen'].some(auto => brandLower.includes(auto))) {
        return 'Automotive';
    }

    // Sports & Fitness
    if (['reebok', 'under armour', 'puma', 'new balance', 'converse', 'vans', 'gymshark', 'lululemon'].some(sport => brandLower.includes(sport))) {
        return 'Sports & Fitness';
    }

    // Luxury
    if (['rolex', 'omega', 'cartier', 'tiffany & co.', 'hermès'].some(luxury => brandLower.includes(luxury))) {
        return 'Luxury';
    }

    // Gaming
    if (['playstation', 'xbox', 'nintendo', 'steam', 'epic games', 'riot games'].some(gaming => brandLower.includes(gaming))) {
        return 'Gaming';
    }

    // Travel
    if (['air france', 'emirates', 'lufthansa', 'british airways', 'airbnb', 'booking.com'].some(travel => brandLower.includes(travel))) {
        return 'Travel';
    }

    // Retail
    if (['target', 'walmart', 'ikea', 'best buy'].some(retail => brandLower.includes(retail))) {
        return 'Retail';
    }

    return 'General';
}

/**
 * Calcule la pertinence d'une marque pour un persona donné
 */
export function calculateBrandRelevance(brand: string, persona: Partial<Persona>): number {
    let score = 50;
    const brandCategory = categorizeBrand(brand);
    const occupation = persona.occupation?.toLowerCase() || '';
    const age = persona.age || 25;

    // Bonus basé sur l'occupation
    const occupationBonuses: { [key: string]: { [key: string]: number } } = {
        'Technology': {
            'développeur': 30,
            'ingénieur': 25,
            'data': 20,
            'tech': 25,
            'informatique': 25
        },
        'Fashion & Lifestyle': {
            'marketing': 25,
            'design': 20,
            'communication': 20,
            'créatif': 25,
            'styliste': 30
        },
        'Beauty & Cosmetics': {
            'design': 20,
            'marketing': 15,
            'esthétique': 30,
            'beauté': 30
        },
        'Entertainment': {
            'média': 25,
            'communication': 20,
            'créatif': 20,
            'journaliste': 25
        },
        'Gaming': {
            'développeur': 25,
            'game': 30,
            'tech': 20
        }
    };

    if (occupationBonuses[brandCategory]) {
        Object.entries(occupationBonuses[brandCategory]).forEach(([key, bonus]) => {
            if (occupation.includes(key)) {
                score += bonus;
            }
        });
    }

    // Bonus basé sur l'âge et les plateformes de la marque
    const brandPlatforms = getBrandSocialPlatforms(brand);
    if (age < 25 && ['TikTok', 'Snapchat'].some(platform => brandPlatforms.includes(platform))) {
        score += 15;
    }
    if (age > 35 && ['LinkedIn', 'Facebook'].some(platform => brandPlatforms.includes(platform))) {
        score += 10;
    }

    // Bonus pour les marques populaires chez les jeunes
    const youthBrands = ['nike', 'adidas', 'supreme', 'off-white', 'netflix', 'spotify'];
    if (age < 30 && youthBrands.some(youthBrand => brand.toLowerCase().includes(youthBrand))) {
        score += 10;
    }

    // Bonus pour les marques professionnelles
    const professionalBrands = ['microsoft', 'linkedin', 'adobe', 'google'];
    if (occupation.includes('professionnel') && professionalBrands.some(profBrand => brand.toLowerCase().includes(profBrand))) {
        score += 15;
    }

    return Math.min(100, Math.max(0, score));
}

/**
 * Génère une influence de marque complète
 */
export function generateBrandInfluence(brand: string, persona: Partial<Persona>): BrandInfluence {
    return {
        brand,
        category: categorizeBrand(brand),
        platforms: getBrandSocialPlatforms(brand),
        relevanceScore: calculateBrandRelevance(brand, persona)
    };
}