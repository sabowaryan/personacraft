/**
 * Bundle optimization utilities
 */

// Lazy load heavy components
export const lazyImport = <T extends Record<string, any>>(
  importFn: () => Promise<T>,
  namedExport?: keyof T
) => {
  return async () => {
    const module = await importFn();
    return namedExport ? module[namedExport] : module.default;
  };
};

// Optimize string handling for large content
export const optimizeStringHandling = (content: string): string => {
  // Use Buffer for large strings when available
  if (typeof Buffer !== 'undefined' && content.length > 10000) {
    return Buffer.from(content, 'utf-8').toString();
  }
  return content;
};

// Chunk large arrays for better performance
export const chunkArray = <T>(array: T[], chunkSize: number = 50): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Debounce function for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Memory-efficient object comparison
export const shallowEqual = (obj1: any, obj2: any): boolean => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
};