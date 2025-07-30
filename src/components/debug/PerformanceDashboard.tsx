'use client';

import React, { useState, useEffect } from 'react';

interface PerformanceMetrics {
  cacheStats: {
    hitRate: number;
    totalRequests: number;
    hits: number;
    misses: number;
    size: number;
    memoryUsage: number;
  };
  apiStats: {
    totalCalls: number;
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    timeoutRate: number;
  };
  generationStats: {
    totalGenerations: number;
    averageProcessingTime: number;
    qlooFirstSuccessRate: number;
    validationSuccessRate: number;
  };
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/debug/performance');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Performance Dashboard</h2>
        <p className="text-gray-600">Unable to load performance metrics.</p>
      </div>
    );
  }

  const getCacheHealthColor = (hitRate: number) => {
    if (hitRate >= 0.5) return 'text-green-600';
    if (hitRate >= 0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceStatus = (avgTime: number) => {
    if (avgTime <= 3000) return { status: 'Excellent', color: 'bg-green-500' };
    if (avgTime <= 10000) return { status: 'Bon', color: 'bg-yellow-500' };
    return { status: 'Lent', color: 'bg-red-500' };
  };

  const ProgressBar = ({ value, className = "" }: { value: number; className?: string }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      ></div>
    </div>
  );

  const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      variant === 'success' ? 'bg-green-100 text-green-800' :
      variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
      variant === 'error' ? 'bg-red-100 text-red-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {children}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Alerts Section */}
      {metrics.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            ⚠️ Alertes de Performance
          </h3>
          <div className="space-y-2">
            {metrics.alerts.map((alert, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                {alert.type === 'error' && <span className="text-red-500">❌</span>}
                {alert.type === 'warning' && <span className="text-yellow-500">⚠️</span>}
                {alert.type === 'info' && <span className="text-blue-500">ℹ️</span>}
                <span className="text-sm">{alert.message}</span>
                <span className="text-xs text-gray-500 ml-auto">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-4">
            {[
              { id: 'overview', label: 'Vue d\'ensemble' },
              { id: 'cache', label: 'Cache' },
              { id: 'api', label: 'API' },
              { id: 'generation', label: 'Génération' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
                    <p className={`text-2xl font-bold ${getCacheHealthColor(metrics.cacheStats.hitRate)}`}>
                      {(metrics.cacheStats.hitRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-3xl">💾</div>
                </div>
                <ProgressBar value={metrics.cacheStats.hitRate * 100} className="mt-2" />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Temps Moyen API</p>
                    <p className="text-2xl font-bold">
                      {metrics.apiStats.averageResponseTime.toFixed(0)}ms
                    </p>
                  </div>
                  <div className="text-3xl">⏱️</div>
                </div>
                <Badge variant={getPerformanceStatus(metrics.apiStats.averageResponseTime).status === 'Excellent' ? 'success' : 
                              getPerformanceStatus(metrics.apiStats.averageResponseTime).status === 'Bon' ? 'warning' : 'error'}>
                  {getPerformanceStatus(metrics.apiStats.averageResponseTime).status}
                </Badge>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taux de Succès</p>
                    <p className="text-2xl font-bold text-green-600">
                      {(metrics.apiStats.successRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Générations</p>
                    <p className="text-2xl font-bold">
                      {metrics.generationStats.totalGenerations}
                    </p>
                  </div>
                  <div className="text-3xl">🎭</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cache' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Statistiques du Cache</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Requêtes totales:</span>
                    <span className="font-semibold">{metrics.cacheStats.totalRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache hits:</span>
                    <span className="font-semibold text-green-600">{metrics.cacheStats.hits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache misses:</span>
                    <span className="font-semibold text-red-600">{metrics.cacheStats.misses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taille du cache:</span>
                    <span className="font-semibold">{metrics.cacheStats.size} entrées</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilisation mémoire:</span>
                    <span className="font-semibold">
                      {(metrics.cacheStats.memoryUsage / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Performance du Cache</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Hit Rate</span>
                      <span>{(metrics.cacheStats.hitRate * 100).toFixed(1)}%</span>
                    </div>
                    <ProgressBar value={metrics.cacheStats.hitRate * 100} />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {metrics.cacheStats.hitRate >= 0.5 ? (
                      <div className="flex items-center gap-2 text-green-600">
                        ✅ Cache performance excellente
                      </div>
                    ) : metrics.cacheStats.hitRate >= 0.3 ? (
                      <div className="flex items-center gap-2 text-yellow-600">
                        ⚠️ Cache performance acceptable
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        ❌ Cache performance faible
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Statistiques API</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Appels totaux:</span>
                    <span className="font-semibold">{metrics.apiStats.totalCalls}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temps de réponse moyen:</span>
                    <span className="font-semibold">{metrics.apiStats.averageResponseTime.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux de succès:</span>
                    <span className="font-semibold text-green-600">
                      {(metrics.apiStats.successRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux d'erreur:</span>
                    <span className="font-semibold text-red-600">
                      {(metrics.apiStats.errorRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux de timeout:</span>
                    <span className="font-semibold text-yellow-600">
                      {(metrics.apiStats.timeoutRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'generation' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Statistiques de Génération</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Générations totales:</span>
                    <span className="font-semibold">{metrics.generationStats.totalGenerations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temps moyen:</span>
                    <span className="font-semibold">
                      {(metrics.generationStats.averageProcessingTime / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Succès Qloo-first:</span>
                    <span className="font-semibold text-green-600">
                      {(metrics.generationStats.qlooFirstSuccessRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Succès validation:</span>
                    <span className="font-semibold text-blue-600">
                      {(metrics.generationStats.validationSuccessRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={fetchMetrics}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
      >
        🔄 Actualiser les statistiques
      </button>
    </div>
  );
}