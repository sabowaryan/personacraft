import jsPDF from 'jspdf';
import { Persona } from '../types/persona';

export interface PDFGenerationOptions {
  format: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  includeCharts: boolean;
  includeMetadata: boolean;
  theme: 'light' | 'dark' | 'brand';
}

export class PDFGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number = 20;

  constructor(options: Partial<PDFGenerationOptions> = {}) {
    const defaultOptions: PDFGenerationOptions = {
      format: 'a4',
      orientation: 'portrait',
      includeCharts: false,
      includeMetadata: true,
      theme: 'light'
    };

    const config = { ...defaultOptions, ...options };
    
    this.doc = new jsPDF({
      orientation: config.orientation,
      unit: 'mm',
      format: config.format
    });

    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
  }

  public generatePersonaPDF(persona: Persona): Uint8Array {
    this.addHeader(persona);
    this.addPersonalInfo(persona);
    this.addQuote(persona);
    this.addSummaryStats(persona);
    this.addBiography(persona);
    this.addValues(persona);
    this.addInterests(persona);
    this.addCommunicationProfile(persona);
    this.addMarketingProfile(persona);
    this.addMetadata(persona);

    return new Uint8Array(this.doc.output('arraybuffer') as ArrayBuffer);
  }

  private addHeader(persona: Persona): void {
    // Couleurs du thème PersonaCraft
    const primaryColor = [253, 202, 0]; // Jaune/doré #fdca00
    const secondaryColor = [5, 80, 60]; // Vert foncé #05503c
    
    // Bannière de fond avec gradient simulé
    this.doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    this.doc.rect(0, 0, this.pageWidth, 45, 'F');
    
    // Logo PersonaCraft (simulé avec texte stylé)
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    this.doc.text('PersonaCraft', this.margin, 15);
    
    // Titre principal en blanc sur la droite
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('PERSONA MARKETING', this.pageWidth - this.margin, 15, { align: 'right' });
    
    // Sous-titre
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Rapport d\'analyse personnalisé', this.pageWidth - this.margin, 25, { align: 'right' });
    
    // Date de génération
    this.doc.setFontSize(9);
    this.doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    const dateStr = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });
    this.doc.text(`Généré le ${dateStr}`, this.pageWidth - this.margin, 35, { align: 'right' });
    
    this.currentY = 55;
    
    // Section persona avec avatar
    this.addPersonaHeader(persona);
  }

  private addPersonaHeader(persona: Persona): void {
    const primaryColor = [253, 202, 0];
    const secondaryColor = [5, 80, 60];
    
    // Cadre pour la section persona
    this.doc.setFillColor(248, 250, 252); // Gris très clair
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35, 'F');
    
    // Bordure colorée
    this.doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    this.doc.rect(this.margin, this.currentY, 3, 35, 'F');
    
    // Avatar simulé (cercle avec initiales)
    const avatarX = this.margin + 15;
    const avatarY = this.currentY + 17.5;
    const avatarRadius = 12;
    
    // Cercle de fond pour l'avatar
    this.doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    this.doc.circle(avatarX, avatarY, avatarRadius, 'F');
    
    // Initiales dans l'avatar
    const initials = persona.name.split(' ').map(n => n[0]).join('').toUpperCase();
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(initials, avatarX, avatarY + 3, { align: 'center' });
    
    // Nom du persona
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    this.doc.text(persona.name, avatarX + avatarRadius + 10, this.currentY + 15);
    
    // Informations de base
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(`${persona.age} ans • ${persona.location}`, avatarX + avatarRadius + 10, this.currentY + 25);
    
    // Badge "Premium" ou statut
    const badgeX = this.pageWidth - this.margin - 25;
    this.doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    this.doc.rect(badgeX, this.currentY + 8, 20, 8, 'F');
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('PREMIUM', badgeX + 10, this.currentY + 13, { align: 'center' });
    
    this.currentY += 45;
    
    // Ligne de séparation élégante
    this.doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    this.currentY += 15;
  }

  private addPersonalInfo(persona: Persona): void {
    this.addSectionTitle('INFORMATIONS GÉNÉRALES');
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const info = [
      `Âge: ${persona.age} ans`,
      `Localisation: ${persona.location}`,
      `Généré le: ${new Date(persona.generatedAt).toLocaleDateString('fr-FR')}`
    ];
    
    info.forEach(line => {
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 6;
    });
    
    this.currentY += 5;
  }

  private addBiography(persona: Persona): void {
    this.addSectionTitle('BIOGRAPHIE');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const bioLines = this.doc.splitTextToSize(persona.bio, this.pageWidth - 2 * this.margin);
    this.doc.text(bioLines, this.margin, this.currentY);
    this.currentY += bioLines.length * 5 + 10;
  }

  private addQuote(persona: Persona): void {
    this.addSectionTitle('CITATION PERSONNELLE');
    
    // Couleurs du thème
    const primaryColor = [253, 202, 0]; // Jaune/doré
    const lightPrimary = [255, 248, 179]; // Jaune très clair
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(60, 60, 60); // Gris foncé
    
    const quote = `"${persona.quote}"`;
    const quoteLines = this.doc.splitTextToSize(quote, this.pageWidth - 2 * this.margin - 20);
    
    // Cadre coloré pour la citation
    const quoteHeight = quoteLines.length * 6 + 15;
    this.doc.setFillColor(lightPrimary[0], lightPrimary[1], lightPrimary[2]);
    this.doc.rect(this.margin + 5, this.currentY - 5, this.pageWidth - 2 * this.margin - 10, quoteHeight, 'F');
    
    // Bordure gauche colorée
    this.doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    this.doc.rect(this.margin + 5, this.currentY - 5, 3, quoteHeight, 'F');
    
    this.doc.text(quoteLines, this.margin + 15, this.currentY + 5);
    this.currentY += quoteHeight + 10;
    
    // Reset couleur
    this.doc.setTextColor(0, 0, 0);
  }

  private addValues(persona: Persona): void {
    this.addSectionTitle('VALEURS FONDAMENTALES');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    persona.values.forEach(value => {
      this.doc.text(`• ${value}`, this.margin + 5, this.currentY);
      this.currentY += 6;
    });
    
    this.currentY += 5;
  }

  private addInterests(persona: Persona): void {
    this.addSectionTitle('CENTRES D\'INTÉRÊT');
    
    const categories = [
      { name: 'Musique', items: persona.interests.music },
      { name: 'Marques', items: persona.interests.brands },
      { name: 'Films & Séries', items: persona.interests.movies },
      { name: 'Cuisine', items: persona.interests.food },
      { name: 'Lectures', items: persona.interests.books },
      { name: 'Style de vie', items: persona.interests.lifestyle }
    ];
    
    categories.forEach(category => {
      if (category.items.length > 0) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`${category.name}:`, this.margin, this.currentY);
        this.currentY += 6;
        
        this.doc.setFont('helvetica', 'normal');
        category.items.forEach(item => {
          this.doc.text(`  • ${item}`, this.margin + 5, this.currentY);
          this.currentY += 5;
        });
        
        this.currentY += 3;
      }
    });
  }

  private addCommunicationProfile(persona: Persona): void {
    this.checkPageBreak(50);
    this.addSectionTitle('PROFIL DE COMMUNICATION');
    
    const commData = [
      { label: 'Canaux préférés', value: persona.communication.preferredChannels.join(', ') },
      { label: 'Ton de communication', value: persona.communication.tone },
      { label: 'Types de contenu', value: persona.communication.contentTypes.join(', ') },
      { label: 'Fréquence', value: persona.communication.frequency }
    ];
    
    commData.forEach(item => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${item.label}:`, this.margin, this.currentY);
      this.currentY += 6;
      
      this.doc.setFont('helvetica', 'normal');
      const valueLines = this.doc.splitTextToSize(item.value, this.pageWidth - 2 * this.margin - 10);
      this.doc.text(valueLines, this.margin + 5, this.currentY);
      this.currentY += valueLines.length * 5 + 5;
    });
  }

  private addMarketingProfile(persona: Persona): void {
    this.checkPageBreak(80);
    this.addSectionTitle('PROFIL MARKETING');
    
    // Points de douleur
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Points de douleur:', this.margin, this.currentY);
    this.currentY += 6;
    
    this.doc.setFont('helvetica', 'normal');
    persona.marketing.painPoints.forEach(point => {
      const pointLines = this.doc.splitTextToSize(`• ${point}`, this.pageWidth - 2 * this.margin - 10);
      this.doc.text(pointLines, this.margin + 5, this.currentY);
      this.currentY += pointLines.length * 5 + 2;
    });
    
    this.currentY += 5;
    
    // Motivations
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Motivations:', this.margin, this.currentY);
    this.currentY += 6;
    
    this.doc.setFont('helvetica', 'normal');
    persona.marketing.motivations.forEach(motivation => {
      const motivationLines = this.doc.splitTextToSize(`• ${motivation}`, this.pageWidth - 2 * this.margin - 10);
      this.doc.text(motivationLines, this.margin + 5, this.currentY);
      this.currentY += motivationLines.length * 5 + 2;
    });
    
    this.currentY += 5;
    
    // Comportement d'achat
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Comportement d\'achat:', this.margin, this.currentY);
    this.currentY += 6;
    
    this.doc.setFont('helvetica', 'normal');
    const behaviorLines = this.doc.splitTextToSize(persona.marketing.buyingBehavior, this.pageWidth - 2 * this.margin - 10);
    this.doc.text(behaviorLines, this.margin + 5, this.currentY);
    this.currentY += behaviorLines.length * 5 + 10;
  }

  private addSummaryStats(persona: Persona): void {
    this.addSectionTitle('APERÇU STATISTIQUE');
    
    const primaryColor = [253, 202, 0];
    const secondaryColor = [5, 80, 60];
    
    // Calculer les statistiques
    const stats = [
      {
        label: 'Valeurs',
        value: persona.values.length,
        color: [59, 130, 246], // Bleu
        description: 'valeurs fondamentales'
      },
      {
        label: 'Intérêts',
        value: Object.values(persona.interests).flat().length,
        color: [34, 197, 94], // Vert
        description: 'centres d\'intérêt'
      },
      {
        label: 'Canaux',
        value: persona.communication.preferredChannels.length,
        color: [168, 85, 247], // Violet
        description: 'canaux de communication'
      },
      {
        label: 'Points clés',
        value: persona.marketing.painPoints.length,
        color: [245, 158, 11], // Ambre
        description: 'points de douleur identifiés'
      }
    ];
    
    // Grille de statistiques
    const cardWidth = (this.pageWidth - 2 * this.margin - 15) / 4; // 4 colonnes avec espacement
    const cardHeight = 25;
    
    stats.forEach((stat, index) => {
      const x = this.margin + index * (cardWidth + 5);
      const y = this.currentY;
      
      // Fond de la carte
      this.doc.setFillColor(248, 250, 252);
      this.doc.rect(x, y, cardWidth, cardHeight, 'F');
      
      // Bordure colorée en haut
      this.doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
      this.doc.rect(x, y, cardWidth, 3, 'F');
      
      // Valeur principale
      this.doc.setFontSize(18);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
      this.doc.text(stat.value.toString(), x + cardWidth/2, y + 12, { align: 'center' });
      
      // Label
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(60, 60, 60);
      this.doc.text(stat.label, x + cardWidth/2, y + 18, { align: 'center' });
      
      // Description
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(120, 120, 120);
      this.doc.text(stat.description, x + cardWidth/2, y + 22, { align: 'center' });
    });
    
    this.currentY += cardHeight + 15;
  }

  private addMetadata(persona: Persona): void {
    this.checkPageBreak(50);
    
    // Couleurs du thème
    const primaryColor = [253, 202, 0];
    const secondaryColor = [5, 80, 60];
    
    // Titre de section avec style
    this.addSectionTitle('INFORMATIONS TECHNIQUES');
    
    // Cadre pour les métadonnées
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 45, 'F');
    
    // Bordure colorée
    this.doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    this.doc.rect(this.margin, this.currentY, 3, 45, 'F');
    
    this.currentY += 8;
    
    // Sources de données
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    this.doc.text('Sources de données utilisées :', this.margin + 10, this.currentY);
    this.currentY += 6;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    
    persona.sources.forEach((source, index) => {
      this.doc.text(`• ${source}`, this.margin + 15, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 3;
    
    // Informations de génération
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    this.doc.text('Informations de génération :', this.margin + 10, this.currentY);
    this.currentY += 6;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);
    
    const generationInfo = [
      `ID du persona : ${persona.id}`,
      `Date de création : ${new Date(persona.generatedAt).toLocaleString('fr-FR')}`,
      `Plateforme : PersonaCraft v2.0`
    ];
    
    generationInfo.forEach(info => {
      this.doc.text(`• ${info}`, this.margin + 15, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 10;
    
    // Footer professionnel
    this.addFooter();
  }

  private addFooter(): void {
    const primaryColor = [253, 202, 0];
    const secondaryColor = [5, 80, 60];
    
    // Ligne de séparation
    this.doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    this.currentY += 10;
    
    // Logo et informations de contact
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    this.doc.text('PersonaCraft', this.margin, this.currentY);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Plateforme de génération de personas marketing alimentée par l\'IA', this.margin, this.currentY + 8);
    
    // Informations de contact à droite
    this.doc.text('https://personacraft.com', this.pageWidth - this.margin, this.currentY, { align: 'right' });
    this.doc.text('Généré avec PersonaCraft © 2024', this.pageWidth - this.margin, this.currentY + 8, { align: 'right' });
    
    // Numéro de page
    const pageNumber = this.doc.internal.pages.length - 1;
    this.doc.setFontSize(8);
    this.doc.text(`Page ${pageNumber}`, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
  }

  private addSectionTitle(title: string): void {
    this.checkPageBreak(15);
    
    // Couleurs du thème
    const primaryColor = [253, 202, 0]; // Jaune/doré
    const secondaryColor = [5, 80, 60]; // Vert foncé
    
    // Fond coloré pour le titre
    this.doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    this.doc.rect(this.margin - 5, this.currentY - 8, this.pageWidth - 2 * this.margin + 10, 12, 'F');
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255); // Blanc sur fond vert
    this.doc.text(title, this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Reset couleur pour le contenu
    this.doc.setTextColor(0, 0, 0);
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }
}

// Fonction utilitaire pour générer un PDF
export async function generatePersonaPDF(
  persona: Persona, 
  options?: Partial<PDFGenerationOptions>
): Promise<Uint8Array> {
  const generator = new PDFGenerator(options);
  return generator.generatePersonaPDF(persona);
}

// Fonction pour télécharger le PDF
export async function downloadPersonaPDF(persona: Persona, options?: Partial<PDFGenerationOptions>): Promise<void> {
  const pdfData = await generatePersonaPDF(persona, options);
  const blob = new Blob([pdfData], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${persona.name.replace(/\s+/g, '_')}_persona.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}