'use client';

import { useState, useEffect } from 'react';

export default function LocalStorageDebug() {
    const [diagnostics, setDiagnostics] = useState<string[]>([]);
    const [isFixed, setIsFixed] = useState(false);

    const runDiagnostic = () => {
        const logs: string[] = [];
        const keys = ['personacraft_session', 'personacraft_personas', 'personacraft_briefs'];
        let hasErrors = false;

        logs.push('🔍 Diagnostic du localStorage...');

        keys.forEach(key => {
            try {
                const data = localStorage.getItem(key);
                logs.push(`\n📋 Clé: ${key}`);

                if (!data) {
                    logs.push('  ✅ Aucune donnée');
                    return;
                }

                logs.push(`  📊 Taille: ${data.length} caractères`);
                logs.push(`  🔤 Début: ${data.substring(0, 50)}...`);

                // Vérifier le format de base
                if (data.trim() === '') {
                    logs.push('  ⚠️  Données vides, suppression...');
                    localStorage.removeItem(key);
                    hasErrors = true;
                    return;
                }

                // Vérifier si c'est du JSON valide
                try {
                    const parsed = JSON.parse(data);
                    logs.push('  ✅ JSON valide');
                    logs.push(`  📝 Type: ${Array.isArray(parsed) ? 'Array' : typeof parsed}`);

                    if (Array.isArray(parsed)) {
                        logs.push(`  📊 Éléments: ${parsed.length}`);
                    } else if (typeof parsed === 'object' && parsed !== null) {
                        logs.push(`  🔑 Propriétés: ${Object.keys(parsed).join(', ')}`);
                    }

                } catch (parseError: any) {
                    logs.push(`  ❌ JSON invalide: ${parseError.message}`);
                    logs.push('  🧹 Suppression des données corrompues...');
                    localStorage.removeItem(key);
                    hasErrors = true;
                }

            } catch (error: any) {
                logs.push(`  💥 Erreur lors de l'accès: ${error.message}`);
                hasErrors = true;
            }
        });

        if (hasErrors) {
            logs.push('\n🔧 Erreurs détectées et corrigées');
            setIsFixed(true);
        } else {
            logs.push('\n✅ Aucune erreur détectée dans le localStorage');
        }

        // Créer une session propre si nécessaire
        if (!localStorage.getItem('personacraft_session')) {
            logs.push('\n🆕 Création d\'une nouvelle session...');
            const newSession = {
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                totalPersonas: 0,
                totalGenerations: 0,
                preferences: {
                    theme: 'light',
                    language: 'fr',
                    autoSave: true
                }
            };
            localStorage.setItem('personacraft_session', JSON.stringify(newSession));
            logs.push('✅ Nouvelle session créée');
        }

        // Initialiser les personas si nécessaire
        if (!localStorage.getItem('personacraft_personas')) {
            logs.push('🆕 Initialisation des personas...');
            localStorage.setItem('personacraft_personas', JSON.stringify([]));
            logs.push('✅ Personas initialisés');
        }

        // Initialiser les briefs si nécessaire
        if (!localStorage.getItem('personacraft_briefs')) {
            logs.push('🆕 Initialisation des briefs...');
            localStorage.setItem('personacraft_briefs', JSON.stringify([]));
            logs.push('✅ Briefs initialisés');
        }

        logs.push('\n🎉 Diagnostic terminé !');
        setDiagnostics(logs);
    };

    const clearAllData = () => {
        const keys = ['personacraft_session', 'personacraft_personas', 'personacraft_briefs'];
        keys.forEach(key => localStorage.removeItem(key));
        setDiagnostics(['🧹 Toutes les données ont été supprimées']);
        setIsFixed(true);
    };

    useEffect(() => {
        runDiagnostic();
    }, []);

    return (
        <div className="card p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-4">🔧 Diagnostic localStorage</h2>
            
            <div className="flex gap-4 mb-6">
                <button 
                    onClick={runDiagnostic}
                    className="btn-primary"
                >
                    🔍 Lancer le diagnostic
                </button>
                <button 
                    onClick={clearAllData}
                    className="btn-secondary"
                >
                    🧹 Nettoyer tout
                </button>
                {isFixed && (
                    <button 
                        onClick={() => window.location.reload()}
                        className="btn-primary bg-green-600 hover:bg-green-700"
                    >
                        🔄 Recharger la page
                    </button>
                )}
            </div>

            <div className="bg-neutral-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
                {diagnostics.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap">
                        {log}
                    </div>
                ))}
            </div>

            {isFixed && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">
                        ✅ Des corrections ont été appliquées. Rechargez la page pour voir les changements.
                    </p>
                </div>
            )}
        </div>
    );
}