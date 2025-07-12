# Recherche API Qloo - Résultats et Découvertes

## 🔍 Informations Générales

### **API Qloo Cultural AI**
- **Site officiel** : https://qloo.com/
- **Documentation** : Pas de documentation publique trouvée
- **Statut** : API hackathon spécifique (https://hackathon.api.qloo.com/)

### **Historique Important**
- **2019** : TasteDive a rejoint Qloo
- **Legacy API** : TasteDive continue d'être supporté en attendant la migration complète
- **Format** : L'API hackathon semble utiliser un format différent de l'API principale

## 🔧 Configuration API Hackathon

### **Authentification Trouvée**
- **Header requis** : `X-API-Key` (au lieu de `Authorization: Bearer`)
- **URL de base** : `https://hackathon.api.qloo.com/`
- **Version** : 2.1.235 (détectée lors du test)

### **Tests d'Authentification**
```bash
# ❌ Échec avec Bearer
curl -H "Authorization: Bearer 32_1GLe_0t05IQmBI7UqVYh2A0pT9oeOgQZtsuzL594" https://hackathon.api.qloo.com/
# Résultat : { "error": { "reason": "No API key found in request", "message": "Unauthorized", "code": 401 } }

# ✅ Succès avec X-API-Key
curl -H "X-API-Key: 32_1GLe_0t05IQmBI7UqVYh2A0pT9oeOgQZtsuzL594" https://hackathon.api.qloo.com/
# Résultat : {"title":"Qloo","description":"Qloo API","documentation":"https://docs.qloo.com"...}
```

## 🎯 Endpoints Découverts

### **Endpoint Principal**
- **Base** : `https://hackathon.api.qloo.com/`
- **Recommendations** : `/recommendations` (avec paramètres query)
- **Méthode** : GET avec query parameters

### **Paramètres Requis**
- `type` : Type de recommandation (music, brands, movies, etc.)
- `age` : Âge de l'utilisateur
- `location` : Localisation
- `interests` : Intérêts séparés par des virgules

### **Exemple d'Appel**
```bash
curl -H "X-API-Key: 32_1GLe_0t05IQmBI7UqVYh2A0pT9oeOgQZtsuzL594" \
  "https://hackathon.api.qloo.com/recommendations?type=brands&age=30&location=Paris&interests=technologie,écologie,startup"
```

## 🚫 Limitations Découvertes

### **Erreurs Rencontrées**
- **Music** : `403 Forbidden` - Accès non autorisé
- **Brands** : Endpoint testé mais interrompu
- **Format JSON** : N'utilise pas le format POST JSON classique

### **Différences avec l'API Standard**
- Utilise des **query parameters** au lieu de **JSON body**
- Authentification via **X-API-Key** au lieu de **Bearer token**
- Structure différente des **legacy TasteDive API**

## 🔄 Modifications Appliquées

### **Dans le Code**
1. **Header d'authentification** : `X-API-Key` au lieu de `Authorization: Bearer`
2. **URL de base** : `https://hackathon.api.qloo.com` 
3. **Configuration** : Mise à jour du fichier `.env.local` avec les vraies clés

### **Fichiers Modifiés**
- `lib/api/qloo.ts` : Changement du header d'authentification
- `.env.local` : Ajout des vraies clés API (Qloo + Gemini)
- `.env.example` : Mise à jour avec les bonnes URLs et clés

## 🎯 Prochaines Étapes

1. **Tester différents endpoints** pour identifier la structure correcte
2. **Adapter la logique** pour utiliser des query parameters
3. **Vérifier les types de données** supportés par l'API hackathon
4. **Implémenter la conversion** des formats de données

## 📚 Ressources Utiles

- **Site principal** : https://qloo.com/
- **TasteDive Legacy** : https://tastedive.com/read/api
- **Format TasteDive** : Query parameters avec virgules pour séparer les éléments
- **Documentation générale** : https://docs.qloo.com/ (mentionné mais non accessible)

## 🔑 Clés de Configuration

```env
# Qloo Hackathon API
QLOO_API_KEY=32_1GLe_0t05IQmBI7UqVYh2A0pT9oeOgQZtsuzL594
QLOO_API_URL=https://hackathon.api.qloo.com/

# Google Gemini API
GEMINI_API_KEY=AIzaSyCzyFKK4pkIQ74neD9izxdtTmfx0oRlLG0
```

---

**Date de recherche** : $(date +"%Y-%m-%d %H:%M:%S")  
**Statut** : API hackathon identifiée, authentification corrigée, tests en cours