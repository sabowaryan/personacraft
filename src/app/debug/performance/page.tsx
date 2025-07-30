import { PerformanceDashboard } from '@/components/debug/PerformanceDashboard';

export default function PerformanceDebugPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">🚀 Performance Monitor</h1>
                <p className="text-gray-600">
                    Surveillance en temps réel des performances de l'API Qloo et du système de cache.
                </p>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">📊 Améliorations apportées</h2>
                <ul className="space-y-1 text-sm">
                    <li>✅ Cache timeout augmenté de 5min à 1h</li>
                    <li>✅ Clés de cache optimisées (groupement par décennie d'âge)</li>
                    <li>✅ Traitement par lots prioritaires</li>
                    <li>✅ Nettoyage automatique du cache expiré</li>
                    <li>✅ Monitoring de performance intégré</li>
                    <li>✅ Timeout des requêtes réduit de 10s à 8s</li>
                </ul>
            </div>

            <PerformanceDashboard />

            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">💡 Conseils d'optimisation</h2>
                <ul className="space-y-1 text-sm">
                    <li>• Un cache hit rate {'>'} 40% indique une bonne optimisation</li>
                    <li>• Les temps de réponse moyens devraient être {'<'} 2000ms</li>
                    <li>• Surveillez la taille du cache pour éviter une consommation mémoire excessive</li>
                    <li>• Les requêtes par lots réduisent la charge sur l'API Qloo</li>
                </ul>
            </div>
        </div>
    );
}