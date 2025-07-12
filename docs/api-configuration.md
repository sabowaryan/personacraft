# Configuration des APIs - PersonaCraft

Ce guide vous aide à configurer correctement les APIs pour éviter les erreurs d'authentification.

## 🔧 Erreurs corrigées

### ✅ Erreur Gemini API corrigée
- **Problème** : `models/gemini-pro is not found for API version v1beta`
- **Solution** : Mise à jour du modèle vers `gemini-1.5-flash`

### ✅ Erreur Qloo API corrigée
- **Problème** : `HTTP 401: Unauthorized`
- **Solution** : Amélioration de la gestion d'erreurs et fallback vers les données simulées

## 📋 Configuration requise

### 1. API Google Gemini (OBLIGATOIRE)

#### Obtenir une clé API :
1. Rendez-vous sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Create API key"
4. Copiez la clé générée

#### Configuration :
```bash
# Dans votre fichier .env.local
GEMINI_API_KEY=votre_clé_api_gemini_ici
```

#### Modèles disponibles :
- `gemini-1.5-flash` (défaut - recommandé)
- `gemini-1.5-flash-002` (version plus récente)
- `gemini-1.5-pro` (plus puissant mais plus cher)
- `gemini-2.0-flash` (dernière version)

### 2. API Qloo (OPTIONNEL)

#### Obtenir une clé API :
1. Rendez-vous sur [Qloo Documentation](https://docs.qloo.com/)
2. Contactez Qloo pour obtenir l'accès à l'API
3. Suivez leur processus d'intégration

#### Configuration :
```bash
# Dans votre fichier .env.local
QLOO_API_KEY=votre_clé_api_qloo_ici
```

#### Mode de fonctionnement :
- **Avec clé API** : Utilise les vraies données culturelles de Qloo
- **Sans clé API** : Utilise des données simulées (mode démo)

## 🚀 Configuration rapide

### Étape 1 : Copier le fichier d'exemple
```bash
cp .env.example .env.local
```

### Étape 2 : Configurer les variables
```bash
# Obligatoire
GEMINI_API_KEY=votre_clé_api_gemini_ici

# Optionnel
QLOO_API_KEY=votre_clé_api_qloo_ici
```

### Étape 3 : Redémarrer l'application
```bash
npm run dev
```

## 🔍 Diagnostic des erreurs

### Erreurs Gemini courantes :

#### 404 - Modèle non trouvé
```
Erreur : models/gemini-pro is not found
Solution : Le modèle a été mis à jour vers gemini-1.5-flash
```

#### 401/403 - Authentification
```
Erreur : Unauthorized ou Forbidden
Solution : Vérifiez votre clé API Gemini
```

#### 429 - Limite de taux
```
Erreur : Too Many Requests
Solution : Attendez avant de refaire une requête
```

### Erreurs Qloo courantes :

#### 401 - Clé API invalide
```
Erreur : HTTP 401: Unauthorized
Solution : Configurez votre clé API Qloo (obligatoire)
```

#### 403 - Permissions insuffisantes
```
Erreur : HTTP 403: Forbidden
Solution : Contactez Qloo pour vérifier vos permissions
```

## 📊 Vérification du statut

### Vérifier la configuration :
```bash
# Endpoint de diagnostic
GET /api/generate-persona

# Réponse attendue :
{
  "api_status": {
    "gemini": "configured" | "not configured",
    "qloo": "configured" | "not configured - API key required"
  }
}
```

### Tester les APIs :
```bash
# Tester Gemini
curl -X POST http://localhost:3000/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, world!"}'

# Tester Qloo
curl -X POST http://localhost:3000/api/qloo \
  -H "Content-Type: application/json" \
  -d '{"interests": ["technology"]}'
```

## 💡 Conseils

1. **Sécurité** : Ne jamais commiter vos clés API
2. **Environnement** : Utilisez `.env.local` pour le développement
3. **Production** : Configurez les variables d'environnement sur votre plateforme
4. **Monitoring** : Surveillez votre utilisation des APIs
5. **Fallback** : L'app fonctionne en mode démo sans Qloo

## 📞 Support

Si vous rencontrez encore des problèmes :
1. Vérifiez que `.env.local` est bien configuré
2. Redémarrez l'application
3. Consultez les logs dans la console
4. Vérifiez les quotas de vos APIs

## 🔄 Historique des modifications

- **v1.0** : Support initial de `gemini-pro` et `qloo`
- **v1.1** : Migration vers `gemini-1.5-flash` et amélioration de la gestion d'erreurs
- **v1.2** : Clé API Qloo rendue obligatoire et messages d'erreur explicites