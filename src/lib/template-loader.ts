/**
 * Efficient template loader with Buffer support and caching
 */

interface TemplateCache {
  content: string;
  timestamp: number;
}

class TemplateLoader {
  private static cache = new Map<string, TemplateCache>();
  private static readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour

  /**
   * Load template with efficient caching and Buffer usage
   */
  static async loadTemplate(templateId: string): Promise<string> {
    const cached = this.cache.get(templateId);
    const now = Date.now();

    // Return cached version if still valid
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.content;
    }

    let content: string;

    try {
      if (typeof window !== 'undefined') {
        // Client-side: fetch as ArrayBuffer for better performance
        const response = await fetch(`/templates/${this.getTemplateFileName(templateId)}`);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          content = new TextDecoder().decode(buffer);
        } else {
          throw new Error('Template not found');
        }
      } else {
        // Server-side: use Buffer for better memory efficiency
        const fs = await import('fs/promises');
        const path = await import('path');
        const templatePath = path.join(process.cwd(), 'public', 'templates', this.getTemplateFileName(templateId));
        
        const buffer = await fs.readFile(templatePath);
        content = buffer.toString('utf-8');
      }
    } catch (error) {
      console.warn(`Template ${templateId} not found, using minimal fallback`);
      content = this.getMinimalFallback(templateId);
    }

    // Cache the result
    this.cache.set(templateId, {
      content,
      timestamp: now
    });

    return content;
  }

  /**
   * Map template ID to filename
   */
  private static getTemplateFileName(templateId: string): string {
    const fileMap: Record<string, string> = {
      'persona-generation-v2': 'persona-generation.template',
      'persona-generation-simple-v1': 'persona-simple.template',
      'persona-generation-b2b-v1': 'persona-b2b.template'
    };
    return fileMap[templateId] || 'persona-generation.template';
  }

  /**
   * Minimal fallback templates to reduce bundle size
   */
  private static getMinimalFallback(templateId: string): string {
    const fallbacks: Record<string, string> = {
      'persona-generation-v2': 'Generate {{personaCount}} personas for: "{{brief}}" in JSON format.',
      'persona-generation-simple-v1': 'Create {{personaCount}} simple personas for: "{{brief}}" in JSON.',
      'persona-generation-b2b-v1': 'Generate {{personaCount}} B2B personas for: "{{brief}}" in JSON.'
    };
    return fallbacks[templateId] || fallbacks['persona-generation-v2'];
  }

  /**
   * Clear cache (useful for development)
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  static getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

export default TemplateLoader;