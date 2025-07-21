'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { WifiOff, RefreshCw, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Persona } from '@/lib/types/persona';
import { useNetworkStatus } from '../error/retry-mechanisms';

interface CachedPersonaData {
  persona: Persona;
  timestamp: number;
  version: string;
}

interface OfflineSupportProps {
  personaId: string;
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<{ cachedData: CachedPersonaData | null }>;
}

// Cache management utilities
class PersonaCache {
  private static readonly CACHE_KEY = 'personacraft_cached_personas';
  private static readonly CACHE_VERSION = '1.0.0';
  private static readonly MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly MAX_CACHE_SIZE = 50; // Maximum number of cached personas

  static set(personaId: string, persona: Persona): void {
    try {
      const cache = this.getAll();
      const cachedData: CachedPersonaData = {
        persona,
        timestamp: Date.now(),
        version: this.CACHE_VERSION,
      };
      
      cache[personaId] = cachedData;
      
      // Clean old entries if cache is too large
      this.cleanCache(cache);
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to cache persona data:', error);
    }
  }

  static get(personaId: string): CachedPersonaData | null {
    try {
      const cache = this.getAll();
      const cachedData = cache[personaId];
      
      if (!cachedData) return null;
      
      // Check if cache is expired
      if (Date.now() - cachedData.timestamp > this.MAX_CACHE_AGE) {
        delete cache[personaId];
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        return null;
      }
      
      // Check version compatibility
      if (cachedData.version !== this.CACHE_VERSION) {
        delete cache[personaId];
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        return null;
      }
      
      return cachedData;
    } catch (error) {
      console.warn('Failed to retrieve cached persona data:', error);
      return null;
    }
  }

  static getAll(): Record<string, CachedPersonaData> {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.warn('Failed to retrieve cache:', error);
      return {};
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  static remove(personaId: string): void {
    try {
      const cache = this.getAll();
      delete cache[personaId];
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to remove cached persona:', error);
    }
  }

  private static cleanCache(cache: Record<string, CachedPersonaData>): void {
    const entries = Object.entries(cache);
    
    // Remove expired entries
    const validEntries = entries.filter(([_, data]) => 
      Date.now() - data.timestamp <= this.MAX_CACHE_AGE
    );
    
    // If still too many entries, remove oldest ones
    if (validEntries.length > this.MAX_CACHE_SIZE) {
      validEntries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      validEntries.splice(this.MAX_CACHE_SIZE);
    }
    
    // Rebuild cache object
    const cleanedCache: Record<string, CachedPersonaData> = {};
    validEntries.forEach(([id, data]) => {
      cleanedCache[id] = data;
    });
    
    // Update cache if it was cleaned
    if (Object.keys(cleanedCache).length !== Object.keys(cache).length) {
      Object.keys(cache).forEach(key => delete cache[key]);
      Object.assign(cache, cleanedCache);
    }
  }

  static getCacheStats(): {
    totalEntries: number;
    totalSize: string;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    const cache = this.getAll();
    const entries = Object.values(cache);
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        totalSize: '0 KB',
        oldestEntry: null,
        newestEntry: null,
      };
    }
    
    const timestamps = entries.map(entry => entry.timestamp);
    const totalSize = JSON.stringify(cache).length;
    
    return {
      totalEntries: entries.length,
      totalSize: `${(totalSize / 1024).toFixed(1)} KB`,
      oldestEntry: new Date(Math.min(...timestamps)),
      newestEntry: new Date(Math.max(...timestamps)),
    };
  }
}

// Hook for offline support
export const useOfflineSupport = (personaId: string) => {
  const isOnline = useNetworkStatus();
  const [cachedData, setCachedData] = useState<CachedPersonaData | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);

  useEffect(() => {
    // Load cached data when going offline or on component mount
    if (!isOnline || !cachedData) {
      const cached = PersonaCache.get(personaId);
      setCachedData(cached);
      setIsUsingCache(!isOnline && !!cached);
    }
  }, [isOnline, personaId, cachedData]);

  const cachePersona = useCallback((persona: Persona) => {
    PersonaCache.set(personaId, persona);
    setCachedData({
      persona,
      timestamp: Date.now(),
      version: '1.0.0',
    });
  }, [personaId]);

  const clearCache = useCallback(() => {
    PersonaCache.remove(personaId);
    setCachedData(null);
    setIsUsingCache(false);
  }, [personaId]);

  return {
    isOnline,
    cachedData,
    isUsingCache,
    cachePersona,
    clearCache,
  };
};

// Offline support wrapper component
export const OfflineSupport: React.FC<OfflineSupportProps> = ({
  personaId,
  children,
  fallbackComponent: FallbackComponent,
}) => {
  const { isOnline, cachedData, isUsingCache } = useOfflineSupport(personaId);

  if (!isOnline && cachedData) {
    return (
      <div className="space-y-4">
        <OfflineIndicator cachedData={cachedData} />
        {FallbackComponent ? (
          <FallbackComponent cachedData={cachedData} />
        ) : (
          children
        )}
      </div>
    );
  }

  if (!isOnline && !cachedData) {
    return <NoOfflineDataFallback personaId={personaId} />;
  }

  return <>{children}</>;
};

// Offline indicator component
const OfflineIndicator = memo(function OfflineIndicator({ 
  cachedData 
}: { 
  cachedData: CachedPersonaData 
}) {
  const cacheAge = Date.now() - cachedData.timestamp;
  const cacheAgeHours = Math.floor(cacheAge / (1000 * 60 * 60));
  const cacheAgeDays = Math.floor(cacheAgeHours / 24);

  const formatCacheAge = () => {
    if (cacheAgeDays > 0) {
      return `il y a ${cacheAgeDays} jour${cacheAgeDays > 1 ? 's' : ''}`;
    } else if (cacheAgeHours > 0) {
      return `il y a ${cacheAgeHours} heure${cacheAgeHours > 1 ? 's' : ''}`;
    } else {
      return 'récemment';
    }
  };

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
      <WifiOff className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        Mode hors ligne
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        <div className="flex items-center justify-between">
          <span>
            Affichage des données mises en cache {formatCacheAge()}
          </span>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Données disponibles
          </Badge>
        </div>
      </AlertDescription>
    </Alert>
  );
});

// No offline data fallback
const NoOfflineDataFallback = memo(function NoOfflineDataFallback({ 
  personaId 
}: { 
  personaId: string 
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    // Force a page reload to attempt reconnection
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <WifiOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Aucune donnée hors ligne</CardTitle>
          <CardDescription>
            Ce persona n'est pas disponible hors ligne. 
            Connectez-vous à internet pour le consulter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ID du persona: <code className="text-xs bg-muted px-1 rounded">{personaId}</code>
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Reconnexion...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});

// Cache management component
interface CacheManagementProps {
  onCacheCleared?: () => void;
}

export const CacheManagement = memo(function CacheManagement({
  onCacheCleared,
}: CacheManagementProps) {
  const [cacheStats, setCacheStats] = useState(PersonaCache.getCacheStats());
  const [isClearing, setIsClearing] = useState(false);

  const refreshStats = useCallback(() => {
    setCacheStats(PersonaCache.getCacheStats());
  }, []);

  const handleClearCache = useCallback(async () => {
    setIsClearing(true);
    
    try {
      PersonaCache.clear();
      refreshStats();
      onCacheCleared?.();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  }, [refreshStats, onCacheCleared]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Gestion du cache hors ligne
        </CardTitle>
        <CardDescription>
          Gérez les données mises en cache pour l'utilisation hors ligne
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Personas en cache:</span>
            <p className="text-muted-foreground">{cacheStats.totalEntries}</p>
          </div>
          <div>
            <span className="font-medium">Taille du cache:</span>
            <p className="text-muted-foreground">{cacheStats.totalSize}</p>
          </div>
          {cacheStats.oldestEntry && (
            <div>
              <span className="font-medium">Plus ancien:</span>
              <p className="text-muted-foreground">
                {cacheStats.oldestEntry.toLocaleDateString()}
              </p>
            </div>
          )}
          {cacheStats.newestEntry && (
            <div>
              <span className="font-medium">Plus récent:</span>
              <p className="text-muted-foreground">
                {cacheStats.newestEntry.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshStats}
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleClearCache}
            disabled={isClearing || cacheStats.totalEntries === 0}
            size="sm"
          >
            {isClearing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              'Vider le cache'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

// Export the cache utilities for external use
export { PersonaCache };