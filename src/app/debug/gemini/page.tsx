 'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DiagnosticData {
  timestamp: string;
  circuitBreaker: {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number;
    timeUntilReset: number;
  };
  cache: {
    size: number;
    memoryUsage: number;
    oldestEntry: number;
  };
  connection: {
    isConnected: boolean;
    status: string;
  };
  recommendations: string[];
}

export default function GeminiDebugPage() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetResult, setResetResult] = useState<any>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/gemini-status');
      const data = await response.json();
      
      if (data.success) {
        setDiagnostic(data.diagnostic);
      } else {
        console.error('Erreur diagnostic:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors du diagnostic:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetGemini = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/reset-gemini', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setResetResult(data.result);
        // Re-run diagnostic after reset
        await runDiagnostic();
      } else {
        console.error('Erreur réinitialisation:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🔍 Debug Gemini</h1>
        <div className="space-x-2">
          <Button onClick={runDiagnostic} disabled={loading}>
            {loading ? 'Chargement...' : '🔍 Diagnostiquer'}
          </Button>
          <Button onClick={resetGemini} disabled={loading} variant="destructive">
            {loading ? 'Chargement...' : '🔄 Réinitialiser'}
          </Button>
        </div>
      </div>

      {diagnostic && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Circuit Breaker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Circuit Breaker
                <Badge variant={diagnostic.circuitBreaker.isOpen ? 'destructive' : 'default'}>
                  {diagnostic.circuitBreaker.isOpen ? '🔴 Ouvert' : '🟢 Fermé'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>Échecs: {diagnostic.circuitBreaker.failureCount}</div>
              <div>Dernier échec: {formatTime(diagnostic.circuitBreaker.lastFailureTime)}</div>
              {diagnostic.circuitBreaker.isOpen && (
                <div>Réinitialisation dans: {Math.round(diagnostic.circuitBreaker.timeUntilReset / 1000)}s</div>
              )}
            </CardContent>
          </Card>

          {/* Cache */}
          <Card>
            <CardHeader>
              <CardTitle>Cache</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>Taille: {diagnostic.cache.size} entrées</div>
              <div>Mémoire: {formatBytes(diagnostic.cache.memoryUsage)}</div>
              <div>Plus ancien: {formatTime(diagnostic.cache.oldestEntry)}</div>
            </CardContent>
          </Card>

          {/* Connexion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Connexion
                <Badge variant={diagnostic.connection.isConnected ? 'default' : 'destructive'}>
                  {diagnostic.connection.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>Statut: {diagnostic.connection.isConnected ? '✅ Connecté' : '❌ Déconnecté'}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommandations */}
      {diagnostic?.recommendations && diagnostic.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💡 Recommandations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {diagnostic.recommendations.map((rec, index) => (
                <li key={index} className="text-sm">{rec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Résultat de réinitialisation */}
      {resetResult && (
        <Card>
          <CardHeader>
            <CardTitle>🔄 Résultat de la réinitialisation</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(resetResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Timestamp */}
      {diagnostic && (
        <div className="text-sm text-gray-500 text-center">
          Dernier diagnostic: {formatTime(new Date(diagnostic.timestamp).getTime())}
        </div>
      )}
    </div>
  );
}