import { integratedRequestSystem } from './integrated-request-system';

/**
 * Adapter to replace the old Qloo API system with the new integrated system
 * This maintains backward compatibility while providing enhanced performance
 */
export class QlooApiAdapter {
  /**
   * Make a Qloo API request with full optimization
   * Compatible with the current usage pattern
   */
  async makeRequest(
    entityType: string,
    params: {
      age?: number;
      location?: string;
      occupation?: string;
      interests?: string[];
      values?: string[];
      take?: number;
    } = {},
    options: {
      enableCache?: boolean;
      enableBatching?: boolean;
      enablePreloading?: boolean;
      priority?: 'low' | 'medium' | 'high';
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<any> {
    // Create a mock API call function that returns mock data
    // In a real implementation, this would call the actual Qloo API
    const apiCallFn = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
      
      // Return mock data based on entity type
      return this.generateMockData(entityType, params.take || 5);
    };

    const priorityMap = { low: 1, medium: 2, high: 3 };
    
    return integratedRequestSystem.makeOptimizedRequest(
      {
        entityType,
        ...params
      },
      apiCallFn,
      {
        priority: priorityMap[options.priority || 'medium'],
        timeout: options.timeout,
        retries: options.retries,
        enablePreloading: options.enablePreloading
      }
    );
  }

  /**
   * Generate mock data for testing
   */
  private generateMockData(entityType: string, count: number): string[] {
    const mockData: Record<string, string[]> = {
      music: [
        'Daft Punk', 'Justice', 'Moderat', 'Bonobo', 'Thom Yorke',
        'Aphex Twin', 'Boards of Canada', 'Four Tet', 'Burial', 'Jon Hopkins'
      ],
      brand: [
        'Apple', 'Tesla', 'Patagonia', 'Allbirds', 'Notion',
        'Figma', 'Stripe', 'Airbnb', 'Spotify', 'Netflix'
      ],
      movie: [
        'Blade Runner 2049', 'Her', 'Ex Machina', 'Interstellar', 'Arrival',
        'The Social Network', 'Black Mirror', 'Westworld', 'Mr. Robot', 'Silicon Valley'
      ],
      book: [
        'Sapiens', 'The Lean Startup', 'Zero to One', 'Atomic Habits', 'Deep Work',
        'The Design of Everyday Things', 'Hooked', 'The Mom Test', 'Crossing the Chasm', 'Good to Great'
      ],
      tv: [
        'Black Mirror', 'Westworld', 'Mr. Robot', 'Silicon Valley', 'Halt and Catch Fire',
        'Devs', 'Upload', 'The Good Place', 'Community', 'Rick and Morty'
      ],
      fashion: [
        'Uniqlo', 'Everlane', 'COS', 'Arket', 'Muji',
        'Norse Projects', 'A.P.C.', 'Acne Studios', 'Lemaire', 'Issey Miyake'
      ],
      beauty: [
        'Glossier', 'The Ordinary', 'Drunk Elephant', 'Tatcha', 'Fenty Beauty',
        'Rare Beauty', 'Ilia', 'Tower 28', 'Supergoop!', 'Summer Fridays'
      ],
      travel: [
        'Tokyo', 'Copenhagen', 'Stockholm', 'Amsterdam', 'Berlin',
        'San Francisco', 'Portland', 'Austin', 'Montreal', 'Melbourne'
      ]
    };

    const items = mockData[entityType] || [`${entityType}_item_1`, `${entityType}_item_2`];
    return items.slice(0, count);
  }

  /**
   * Make multiple requests in an optimized batch
   */
  async makeBatchRequests(
    requests: Array<{
      entityType: string;
      params: any;
      apiCallFn: () => Promise<any>;
      priority?: number;
    }>
  ): Promise<any[]> {
    const formattedRequests = requests.map(req => ({
      params: {
        entityType: req.entityType,
        ...req.params
      },
      requestFn: req.apiCallFn,
      options: {
        priority: req.priority || 1
      }
    }));

    return integratedRequestSystem.makeBatchRequests(formattedRequests);
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return integratedRequestSystem.getSystemStats();
  }

  /**
   * Setup auto-optimization
   */
  enableAutoOptimization() {
    integratedRequestSystem.setupAutoOptimization();
  }
}

// Singleton instance for easy replacement
export const qlooApiAdapter = new QlooApiAdapter();

// Enable auto-optimization by default
qlooApiAdapter.enableAutoOptimization();