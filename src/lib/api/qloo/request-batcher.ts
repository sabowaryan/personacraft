interface BatchRequest {
  entityType: string;
  params: any;
  priority: number;
  resolve: (data: any) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number;
  priorityLevels: number;
  concurrentBatches: number;
}

export class RequestBatcher {
  private pendingRequests: Map<string, BatchRequest[]> = new Map();
  private activeBatches = 0;
  private config: BatchConfig;
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      maxBatchSize: 5,
      maxWaitTime: 200, // 200ms max wait
      priorityLevels: 3,
      concurrentBatches: 3,
      ...config
    };
  }

  /**
   * Add request to batch queue
   */
  async batchRequest<T>(
    entityType: string,
    params: any,
    priority: number = 1,
    requestFn: (params: any) => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const batchKey = this.getBatchKey(entityType, priority);
      
      if (!this.pendingRequests.has(batchKey)) {
        this.pendingRequests.set(batchKey, []);
      }

      const batch = this.pendingRequests.get(batchKey)!;
      batch.push({
        entityType,
        params,
        priority,
        resolve,
        reject,
        timestamp: Date.now()
      });

      // Process batch if it's full or start timer
      if (batch.length >= this.config.maxBatchSize) {
        this.processBatch(batchKey, requestFn);
      } else if (!this.batchTimers.has(batchKey)) {
        const timer = setTimeout(() => {
          this.processBatch(batchKey, requestFn);
        }, this.config.maxWaitTime);
        this.batchTimers.set(batchKey, timer);
      }
    });
  }

  /**
   * Process a batch of requests
   */
  private async processBatch<T>(
    batchKey: string,
    requestFn: (params: any) => Promise<T>
  ): Promise<void> {
    const batch = this.pendingRequests.get(batchKey);
    if (!batch || batch.length === 0) return;

    // Clear timer and remove from pending
    const timer = this.batchTimers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
    }
    this.pendingRequests.delete(batchKey);

    // Wait if too many concurrent batches
    while (this.activeBatches >= this.config.concurrentBatches) {
      await this.sleep(50);
    }

    this.activeBatches++;
    
    try {
      console.log(`🔄 Processing batch: ${batch.length} ${batch[0].entityType} requests (priority: ${batch[0].priority})`);
      
      // Process requests in parallel within the batch
      const results = await Promise.allSettled(
        batch.map(request => requestFn(request.params))
      );

      // Resolve/reject individual requests
      results.forEach((result, index) => {
        const request = batch[index];
        if (result.status === 'fulfilled') {
          request.resolve(result.value);
        } else {
          request.reject(result.reason);
        }
      });

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      console.log(`✅ Batch completed: ${successCount}/${batch.length} successful`);

    } catch (error) {
      // Reject all requests in batch
      batch.forEach(request => {
        request.reject(error as Error);
      });
      console.error(`❌ Batch failed:`, error);
    } finally {
      this.activeBatches--;
    }
  }

  /**
   * Generate batch key for grouping similar requests
   */
  private getBatchKey(entityType: string, priority: number): string {
    return `${entityType}_p${priority}`;
  }

  /**
   * Get pending requests count
   */
  getPendingCount(): number {
    let total = 0;
    for (const batch of this.pendingRequests.values()) {
      total += batch.length;
    }
    return total;
  }

  /**
   * Get active batches count
   */
  getActiveBatchesCount(): number {
    return this.activeBatches;
  }

  /**
   * Flush all pending requests immediately
   */
  async flushAll<T>(requestFn: (params: any) => Promise<T>): Promise<void> {
    const batchKeys = Array.from(this.pendingRequests.keys());
    
    await Promise.all(
      batchKeys.map(batchKey => this.processBatch(batchKey, requestFn))
    );
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    // Clear all timers
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer);
    }
    this.batchTimers.clear();

    // Reject all pending requests
    for (const batch of this.pendingRequests.values()) {
      batch.forEach(request => {
        request.reject(new Error('Request cancelled'));
      });
    }
    this.pendingRequests.clear();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Smart request prioritizer based on entity type and context
 */
export class RequestPrioritizer {
  private static priorityMap: Record<string, number> = {
    // High priority - core persona data
    music: 5,
    movie: 4,
    brand: 4,
    tv: 4,
    
    // Medium priority - lifestyle data
    book: 3,
    restaurant: 3,
    travel: 3,
    
    // Low priority - supplementary data
    fashion: 2,
    beauty: 2,
    food: 2,
    person: 1,
    socialMedia: 1
  };

  static getPriority(entityType: string, context?: any): number {
    let basePriority = this.priorityMap[entityType] || 1;
    
    // Boost priority based on context
    if (context?.isB2B && ['brand', 'person'].includes(entityType)) {
      basePriority += 1;
    }
    
    if (context?.ageRange?.min > 35 && ['book', 'travel'].includes(entityType)) {
      basePriority += 1;
    }
    
    return Math.min(5, basePriority);
  }

  static sortByPriority(requests: Array<{ entityType: string; context?: any }>): Array<{ entityType: string; context?: any; priority: number }> {
    return requests
      .map(req => ({
        ...req,
        priority: this.getPriority(req.entityType, req.context)
      }))
      .sort((a, b) => b.priority - a.priority);
  }
}

// Singleton instances
export const requestBatcher = new RequestBatcher();
export const prioritizer = RequestPrioritizer;