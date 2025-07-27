/**
 * Script pour configurer le webhook Stack Auth
 * 
 * Ce script vous aide à :
 * 1. Générer un secret webhook sécurisé
 * 2. Configurer l'URL du webhook dans Stack Auth
 * 3. Tester la connexion
 */

const crypto = require('crypto');

function generateWebhookSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function main() {
  console.log('🔧 Configuration du webhook Stack Auth\n');

  // 1. Générer un secret webhook
  const webhookSecret = generateWebhookSecret();
  console.log('1. Secret webhook généré:');
  console.log(`   STACK_WEBHOOK_SECRET='${webhookSecret}'`);
  console.log('   ⚠️  Ajoutez cette ligne à votre fichier .env\n');

  // 2. URL du webhook
  const webhookUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stack`
    : 'http://localhost:3000/api/webhooks/stack';
  
  console.log('2. URL du webhook:');
  console.log(`   ${webhookUrl}`);
  console.log('   ⚠️  Configurez cette URL dans votre dashboard Stack Auth\n');

  // 3. Instructions de configuration
  console.log('3. Instructions de configuration:');
  console.log('   a) Allez sur https://app.stack-auth.com/');
  console.log('   b) Sélectionnez votre projet');
  console.log('   c) Allez dans Settings > Webhooks');
  console.log('   d) Ajoutez un nouveau webhook avec:');
  console.log(`      - URL: ${webhookUrl}`);
  console.log(`      - Secret: ${webhookSecret}`);
  console.log('      - Événements: user.created, user.updated, user.deleted');
  console.log('   e) Sauvegardez la configuration\n');

  // 4. Test de la configuration
  console.log('4. Pour tester la configuration:');
  console.log('   a) Redémarrez votre application Next.js');
  console.log('   b) Créez un nouveau compte utilisateur');
  console.log('   c) Vérifiez les logs de votre application');
  console.log('   d) Vérifiez que l\'utilisateur est créé dans votre base de données\n');

  console.log('✅ Configuration terminée !');
}

main();