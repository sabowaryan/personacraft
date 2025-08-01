import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Template de métadonnées par défaut
const defaultMetadataTemplate = {
    demographics: {
        age_range: "25-35",
        location: "France",
        income_level: "Moyen",
        education_level: "Bac+3/5",
        family_status: "Célibataire"
    },
    psychographics: {
        values: ["Innovation", "Efficacité", "Qualité"],
        interests: ["Technologie", "Business", "Formation"],
        lifestyle: "Actif et connecté",
        personality_traits: ["Analytique", "Pragmatique", "Curieux"]
    },
    behavioral: {
        buying_patterns: ["Recherche approfondie", "Comparaison de prix", "Avis clients"],
        communication_preferences: ["Email", "Réseaux sociaux", "Chat en ligne"],
        technology_adoption: "Early adopter",
        brand_loyalty: "Modérée"
    },
    professional: {
        industry: "Services",
        job_level: "Manager",
        company_size: "PME (50-250 employés)",
        decision_making_role: "Influenceur",
        work_environment: "Hybride"
    }
};

async function fixCompleteMetadataIssues() {
    console.log('🔧 Correction complète des métadonnées...\n');

    try {
        // Récupérer toutes les personas
        const personas = await prisma.persona.findMany({
            select: {
                id: true,
                name: true,
                metadata: true,
                bio: true
            }
        });

        console.log(`📊 ${personas.length} personas trouvées\n`);

        let updatedCount = 0;
        const updatePromises = [];

        for (const persona of personas) {
            console.log(`\n--- Traitement: ${persona.name} ---`);

            let currentMetadata = null;
            let needsUpdate = false;

            // Analyser les métadonnées actuelles
            if (!persona.metadata) {
                console.log('❌ Métadonnées null - création complète nécessaire');
                currentMetadata = {};
                needsUpdate = true;
            } else {
                try {
                    currentMetadata = typeof persona.metadata === 'string'
                        ? JSON.parse(persona.metadata)
                        : persona.metadata;
                } catch (error) {
                    console.log('❌ Erreur de parsing JSON - recréation nécessaire');
                    currentMetadata = {};
                    needsUpdate = true;
                }
            }

            // Vérifier et compléter chaque section
            const requiredSections = ['demographics', 'psychographics', 'behavioral', 'professional'] as const;

            for (const section of requiredSections) {
                if (!currentMetadata[section] || typeof currentMetadata[section] !== 'object') {
                    console.log(`🔧 Ajout de la section manquante: ${section}`);
                    currentMetadata[section] = { ...defaultMetadataTemplate[section] };
                    needsUpdate = true;
                } else {
                    // Vérifier les sous-champs requis
                    const defaultSection = defaultMetadataTemplate[section];
                    for (const [key, defaultValue] of Object.entries(defaultSection)) {
                        if (!currentMetadata[section][key]) {
                            console.log(`🔧 Ajout du champ manquant: ${section}.${key}`);
                            currentMetadata[section][key] = defaultValue;
                            needsUpdate = true;
                        }
                    }
                }
            }

            // Personnaliser les métadonnées basées sur la bio si disponible
            if (persona.bio && needsUpdate) {
                currentMetadata = personalizeMetadata(currentMetadata, persona.bio, persona.name);
            }

            // Mettre à jour si nécessaire
            if (needsUpdate) {
                console.log('✅ Mise à jour nécessaire');

                const updatePromise = prisma.persona.update({
                    where: { id: persona.id },
                    data: {
                        metadata: currentMetadata,
                        templateUsed: 'standard',
                        validationMetadata: {
                            isValid: true,
                            validatedAt: new Date().toISOString(),
                            validationVersion: '1.0',
                            issues: []
                        }
                    }
                });

                updatePromises.push(updatePromise);
                updatedCount++;
            } else {
                console.log('✅ Métadonnées déjà complètes');
            }
        }

        // Exécuter toutes les mises à jour
        if (updatePromises.length > 0) {
            console.log(`\n🚀 Exécution de ${updatePromises.length} mises à jour...`);
            await Promise.all(updatePromises);
            console.log('✅ Toutes les mises à jour terminées');
        }

        console.log(`\n📈 RÉSUMÉ:`);
        console.log(`✅ ${updatedCount} personas mis à jour`);
        console.log(`✅ ${personas.length - updatedCount} personas déjà valides`);

    } catch (error) {
        console.error('❌ Erreur lors de la correction:', error);
    } finally {
        await prisma.$disconnect();
    }
}

function personalizeMetadata(metadata: any, bio: string, name: string): any {
    const desc = bio.toLowerCase();
    const personaName = name.toLowerCase();

    // Personnalisation basée sur le contenu de la description

    // Industrie
    if (desc.includes('tech') || desc.includes('développeur') || desc.includes('it')) {
        metadata.professional.industry = 'Technologie';
        metadata.psychographics.interests = ['Technologie', 'Innovation', 'Développement'];
    } else if (desc.includes('marketing') || desc.includes('communication')) {
        metadata.professional.industry = 'Marketing/Communication';
        metadata.psychographics.interests = ['Marketing', 'Communication', 'Créativité'];
    } else if (desc.includes('finance') || desc.includes('comptable')) {
        metadata.professional.industry = 'Finance';
        metadata.psychographics.interests = ['Finance', 'Analyse', 'Stratégie'];
    }

    // Âge basé sur le prénom (approximation)
    if (personaName.includes('jean') || personaName.includes('marie') || personaName.includes('pierre')) {
        metadata.demographics.age_range = '45-55';
        metadata.behavioral.technology_adoption = 'Mainstream';
    } else if (personaName.includes('sophie') || personaName.includes('thomas') || personaName.includes('antoine')) {
        metadata.demographics.age_range = '25-35';
        metadata.behavioral.technology_adoption = 'Early adopter';
    }

    // Niveau d'éducation basé sur la description
    if (desc.includes('manager') || desc.includes('directeur') || desc.includes('expert')) {
        metadata.demographics.education_level = 'Bac+5 et plus';
        metadata.professional.job_level = 'Senior Manager';
    }

    return metadata;
}

// Exécuter le script
fixCompleteMetadataIssues().catch(console.error);