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
    this.addBiography(persona);
    this.addValues(persona);
    this.addInterests(persona);
    this.addCommunicationProfile(persona);
    this.addMarketingProfile(persona);
    this.addMetadata(persona);

    return new Uint8Array(this.doc.output('arraybuffer') as ArrayBuffer);
  }

  private addHeader(persona: Persona): void {
    // Titre principal
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PERSONA MARKETING', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 15;
    
    // Nom du persona
    this.doc.setFontSize(20);
    this.doc.setTextColor(79, 70, 229); // Indigo
    this.doc.text(persona.name.toUpperCase(), this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 10;
    
    // Ligne de séparation
    this.doc.setDrawColor(79, 70, 229);
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
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(79, 70, 229);
    
    const quote = `"${persona.quote}"`;
    const quoteLines = this.doc.splitTextToSize(quote, this.pageWidth - 2 * this.margin - 20);
    
    // Cadre pour la citation
    const quoteHeight = quoteLines.length * 6 + 10;
    this.doc.setFillColor(249, 250, 251);
    this.doc.rect(this.margin + 10, this.currentY - 5, this.pageWidth - 2 * this.margin - 20, quoteHeight, 'F');
    
    this.doc.text(quoteLines, this.margin + 15, this.currentY);
    this.currentY += quoteHeight + 5;
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

  private addMetadata(persona: Persona): void {
    this.checkPageBreak(30);
    this.addSectionTitle('MÉTADONNÉES');
    
    this.doc.setFontSize(9);
    this.doc.setTextColor(128, 128, 128);
    
    const metadata = [
      `ID du persona: ${persona.id}`,
      `Sources de données: ${persona.sources.join(', ')}`,
      `Date de génération: ${persona.generatedAt.toLocaleString('fr-FR')}`,
      `Généré par PersonaCraft - https://personacraft.com`
    ];
    
    metadata.forEach(line => {
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 5;
    });
  }

  private addSectionTitle(title: string): void {
    this.checkPageBreak(20);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(79, 70, 229);
    this.doc.text(title, this.margin, this.currentY);
    
    this.currentY += 8;
    
    // Ligne sous le titre
    this.doc.setDrawColor(79, 70, 229);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.currentY, this.margin + 50, this.currentY);
    
    this.currentY += 8;
    
    // Reset des styles
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