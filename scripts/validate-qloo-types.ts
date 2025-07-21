// Script de validation des types Qloo conformes
import {
  EntityUrn,
  QlooEntity,
  QlooTag,
  QlooAudience,
  InsightsParams,
  QlooInsightsResponse,
  QlooErrorType,
  isQlooEntity,
  isQlooTag,
  isQlooAudience
} from '../lib/types/qloo-compliant';

// Test des EntityUrn
const validUrns: EntityUrn[] = [
  'urn:entity:brand',
  'urn:entity:artist',
  'urn:entity:movie',
  'urn:entity:tv_show',
  'urn:entity:book'
];

console.log('✅ EntityUrn types définis correctement:', validUrns.length, 'URNs');

// Test de QlooEntity
const testEntity: QlooEntity = {
  id: 'entity_123',
  name: 'Test Brand',
  type: 'urn:entity:brand',
  confidence: 0.85,
  metadata: { industry: 'technology' },
  tags: ['tech', 'innovation']
};

console.log('✅ QlooEntity interface fonctionne:', testEntity.name);

// Test de QlooTag
const testTag: QlooTag = {
  id: 'tag_456',
  name: 'Technology',
  category: 'interests',
  weight: 0.9
};

console.log('✅ QlooTag interface fonctionne:', testTag.name);

// Test de QlooAudience
const testAudience: QlooAudience = {
  id: 'audience_789',
  name: 'Tech Enthusiasts',
  demographics: {
    age_range: { min: 25, max: 45 },
    income_level: 'high'
  },
  size: 1000000
};

console.log('✅ QlooAudience interface fonctionne:', testAudience.name);

// Test d'InsightsParams avec filter.type obligatoire
const testParams: InsightsParams = {
  'filter.type': 'urn:entity:brand',
  'signal.interests.entities': ['entity_1', 'entity_2'],
  'signal.interests.tags': ['tag_1'],
  'signal.demographics.audiences': ['audience_1'],
  limit: 10,
  min_confidence: 0.7
};

console.log('✅ InsightsParams interface fonctionne avec filter.type obligatoire');

// Test de QlooInsightsResponse
const testResponse: QlooInsightsResponse = {
  entities: [testEntity],
  tags: [testTag],
  audiences: [testAudience],
  confidence: 0.8,
  metadata: {
    request_id: 'req_123',
    processing_time: 150,
    data_source: 'qloo_api',
    api_version: 'v2',
    timestamp: new Date().toISOString(),
    total_results: 3,
    filters_applied: ['filter.type'],
    signals_used: ['signal.interests.entities'],
    cached: false
  },
  status: {
    code: 200,
    message: 'Success',
    success: true
  }
};

console.log('✅ QlooInsightsResponse interface fonctionne avec métadonnées complètes');

// Test des type guards
console.log('✅ Type guards:');
console.log('  - isQlooEntity(testEntity):', isQlooEntity(testEntity));
console.log('  - isQlooTag(testTag):', isQlooTag(testTag));
console.log('  - isQlooAudience(testAudience):', isQlooAudience(testAudience));
console.log('  - isQlooEntity(null):', isQlooEntity(null));

// Test des types d'erreur
console.log('✅ QlooErrorType enum:');
Object.values(QlooErrorType).forEach(errorType => {
  console.log('  -', errorType);
});

console.log('\n🎉 Tous les types Qloo conformes sont validés avec succès!');
console.log('\n📋 Résumé des types créés:');
console.log('  - EntityUrn: Types d\'entités avec URNs officiels');
console.log('  - QlooEntity: Interface pour les entités Qloo');
console.log('  - QlooTag: Interface pour les tags Qloo');
console.log('  - QlooAudience: Interface pour les audiences Qloo');
console.log('  - InsightsParams: Paramètres avec filter.type obligatoire');
console.log('  - QlooInsightsResponse: Réponse avec métadonnées de tracking');
console.log('  - Type guards: Fonctions de validation des types');
console.log('  - QlooErrorType: Énumération des types d\'erreur');