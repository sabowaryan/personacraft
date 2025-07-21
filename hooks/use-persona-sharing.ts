'use client';

import { useState, useCallback } from 'react';
import { Persona, EnhancedPersona } from '@/lib/types/persona';
import { useToast } from './use-toast';

export type ShareMethod = 'link' | 'email' | 'social' | 'embed' | 'qr';
export type ShareStatus = 'idle' | 'generating' | 'success' | 'error';

export interface ShareOptions {
  method: ShareMethod;
  includePreview?: boolean;
  expiresIn?: number; // hours
  password?: string;
  allowDownload?: boolean;
  customMessage?: string;
  theme?: 'light' | 'dark' | 'brand';
}

export interface ShareState {
  status: ShareStatus;
  shareUrl: string | null;
  qrCode: string | null;
  embedCode: string | null;
  error: string | null;
  expiresAt: Date | null;
}

export interface ShareLink {
  id: string;
  url: string;
  personaId: string;
  createdAt: Date;
  expiresAt: Date | null;
  accessCount: number;
  maxAccess?: number;
  password?: string;
  allowDownload: boolean;
}

export interface UsePersonaSharingReturn {
  shareState: ShareState;
  sharePersona: (persona: Persona | EnhancedPersona, options?: Partial<ShareOptions>) => Promise<void>;
  copyToClipboard: (text: string, label?: string) => Promise<void>;
  generateSecureLink: (persona: Persona | EnhancedPersona, options?: Partial<ShareOptions>) => Promise<string>;
  generateEmbedCode: (persona: Persona | EnhancedPersona, options?: { width?: number; height?: number; theme?: string }) => string;
  generateQRCode: (url: string) => Promise<string>;
  revokeShareLink: (linkId: string) => Promise<void>;
  getShareLinks: () => ShareLink[];
  resetShareState: () => void;
  isSharing: boolean;
}

/**
 * Enhanced hook for persona sharing with secure links and multiple methods
 */
export function usePersonaSharing(): UsePersonaSharingReturn {
  const [shareState, setShareState] = useState<ShareState>({
    status: 'idle',
    shareUrl: null,
    qrCode: null,
    embedCode: null,
    error: null,
    expiresAt: null
  });

  const { toast } = useToast();

  const setError = useCallback((error: string) => {
    setShareState(prev => ({
      ...prev,
      status: 'error',
      error
    }));
    
    toast({
      title: "Erreur de partage",
      description: error,
      variant: "destructive",
    });
  }, [toast]);

  const setSuccess = useCallback((shareUrl: string, qrCode?: string, embedCode?: string, expiresAt?: Date) => {
    setShareState(prev => ({
      ...prev,
      status: 'success',
      shareUrl,
      qrCode: qrCode || null,
      embedCode: embedCode || null,
      error: null,
      expiresAt: expiresAt || null
    }));
  }, []);

  const resetShareState = useCallback(() => {
    setShareState({
      status: 'idle',
      shareUrl: null,
      qrCode: null,
      embedCode: null,
      error: null,
      expiresAt: null
    });
  }, []);

  const generateSecureLink = useCallback(async (
    persona: Persona | EnhancedPersona,
    options: Partial<ShareOptions> = {}
  ): Promise<string> => {
    const defaultOptions: ShareOptions = {
      method: 'link',
      includePreview: true,
      expiresIn: 24, // 24 hours
      allowDownload: true,
      theme: 'brand'
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      // Generate a secure token
      const token = generateSecureToken();
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/shared/persona/${token}`;

      // Store share link data in localStorage (in a real app, this would be server-side)
      const shareLink: ShareLink = {
        id: token,
        url: shareUrl,
        personaId: persona.id,
        createdAt: new Date(),
        expiresAt: finalOptions.expiresIn ? new Date(Date.now() + finalOptions.expiresIn * 60 * 60 * 1000) : null,
        accessCount: 0,
        password: finalOptions.password,
        allowDownload: finalOptions.allowDownload || false
      };

      // Store in localStorage
      const existingLinks = getShareLinks();
      const updatedLinks = [...existingLinks, shareLink];
      localStorage.setItem('persona-share-links', JSON.stringify(updatedLinks));

      // Store persona data for the share link
      localStorage.setItem(`persona-share-${token}`, JSON.stringify({
        persona,
        options: finalOptions
      }));

      return shareUrl;
    } catch (error) {
      throw new Error('Impossible de générer le lien sécurisé');
    }
  }, []);

  const generateQRCode = useCallback(async (url: string): Promise<string> => {
    try {
      // In a real implementation, you would use a QR code library like qrcode
      // For now, we'll use a placeholder service
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      return qrCodeUrl;
    } catch (error) {
      throw new Error('Impossible de générer le QR code');
    }
  }, []);

  const generateEmbedCode = useCallback((
    persona: Persona | EnhancedPersona,
    options: { width?: number; height?: number; theme?: string } = {}
  ): string => {
    const { width = 400, height = 600, theme = 'light' } = options;
    const baseUrl = window.location.origin;
    const embedUrl = `${baseUrl}/embed/persona/${persona.id}?theme=${theme}`;

    return `<iframe 
  src="${embedUrl}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
  title="Persona: ${persona.name}">
</iframe>`;
  }, []);

  const copyToClipboard = useCallback(async (text: string, label: string = 'Texte'): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: `${label} copié dans le presse-papiers.`,
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Copié !",
        description: `${label} copié dans le presse-papiers.`,
      });
    }
  }, [toast]);

  const sharePersona = useCallback(async (
    persona: Persona | EnhancedPersona,
    options: Partial<ShareOptions> = {}
  ) => {
    const defaultOptions: ShareOptions = {
      method: 'link',
      includePreview: true,
      expiresIn: 24,
      allowDownload: true,
      theme: 'brand'
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      setShareState(prev => ({
        ...prev,
        status: 'generating',
        error: null
      }));

      let shareUrl: string;
      let qrCode: string | undefined;
      let embedCode: string | undefined;
      let expiresAt: Date | undefined;

      switch (finalOptions.method) {
        case 'link':
          shareUrl = await generateSecureLink(persona, finalOptions);
          qrCode = await generateQRCode(shareUrl);
          expiresAt = finalOptions.expiresIn ? new Date(Date.now() + finalOptions.expiresIn * 60 * 60 * 1000) : undefined;
          break;

        case 'embed':
          shareUrl = `${window.location.origin}/personas/${persona.id}`;
          embedCode = generateEmbedCode(persona, { theme: finalOptions.theme });
          break;

        case 'email':
          shareUrl = await generateSecureLink(persona, finalOptions);
          const subject = `Persona: ${persona.name}`;
          const body = finalOptions.customMessage || `Découvrez ce persona généré par PersonaCraft: ${shareUrl}`;
          window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          break;

        case 'social':
          shareUrl = await generateSecureLink(persona, finalOptions);
          if (navigator.share) {
            await navigator.share({
              title: `Persona: ${persona.name}`,
              text: finalOptions.customMessage || 'Découvrez ce persona généré par PersonaCraft',
              url: shareUrl,
            });
          } else {
            await copyToClipboard(shareUrl, 'Lien de partage');
          }
          break;

        case 'qr':
          shareUrl = await generateSecureLink(persona, finalOptions);
          qrCode = await generateQRCode(shareUrl);
          break;

        default:
          throw new Error(`Méthode de partage non supportée: ${finalOptions.method}`);
      }

      setSuccess(shareUrl, qrCode, embedCode, expiresAt);

      toast({
        title: "Partage créé",
        description: `Le lien de partage pour ${persona.name} a été généré.`,
      });

    } catch (error) {
      console.error('Erreur lors du partage:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue lors du partage');
    }
  }, [generateSecureLink, generateQRCode, generateEmbedCode, copyToClipboard, setError, setSuccess, toast]);

  const revokeShareLink = useCallback(async (linkId: string): Promise<void> => {
    try {
      const existingLinks = getShareLinks();
      const updatedLinks = existingLinks.filter(link => link.id !== linkId);
      localStorage.setItem('persona-share-links', JSON.stringify(updatedLinks));
      localStorage.removeItem(`persona-share-${linkId}`);

      toast({
        title: "Lien révoqué",
        description: "Le lien de partage a été révoqué avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de révoquer le lien de partage.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const getShareLinks = useCallback((): ShareLink[] => {
    try {
      const links = localStorage.getItem('persona-share-links');
      return links ? JSON.parse(links) : [];
    } catch (error) {
      return [];
    }
  }, []);

  return {
    shareState,
    sharePersona,
    copyToClipboard,
    generateSecureLink,
    generateEmbedCode,
    generateQRCode,
    revokeShareLink,
    getShareLinks,
    resetShareState,
    isSharing: shareState.status === 'generating'
  };
}

// Helper function to generate secure tokens
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hook for managing clipboard operations with formatting preservation
 */
export function useClipboard() {
  const { toast } = useToast();

  const copyText = useCallback(async (text: string, label: string = 'Texte'): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: `${label} copié dans le presse-papiers.`,
      });
    } catch (error) {
      throw new Error('Impossible de copier dans le presse-papiers');
    }
  }, [toast]);

  const copyHTML = useCallback(async (html: string, plainText: string, label: string = 'Contenu'): Promise<void> => {
    try {
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      
      toast({
        title: "Copié avec formatage !",
        description: `${label} copié avec le formatage préservé.`,
      });
    } catch (error) {
      // Fallback to plain text
      await copyText(plainText, label);
    }
  }, [copyText, toast]);

  const copyPersonaData = useCallback(async (
    persona: Persona | EnhancedPersona,
    format: 'text' | 'html' | 'json' = 'text'
  ): Promise<void> => {
    try {
      switch (format) {
        case 'json':
          await copyText(JSON.stringify(persona, null, 2), 'Données JSON');
          break;
          
        case 'html':
          const html = generatePersonaHTML(persona);
          const plainText = generatePersonaText(persona);
          await copyHTML(html, plainText, 'Persona formaté');
          break;
          
        case 'text':
        default:
          const text = generatePersonaText(persona);
          await copyText(text, 'Persona');
          break;
      }
    } catch (error) {
      toast({
        title: "Erreur de copie",
        description: "Impossible de copier les données du persona.",
        variant: "destructive",
      });
    }
  }, [copyText, copyHTML, toast]);

  return {
    copyText,
    copyHTML,
    copyPersonaData
  };
}

// Helper functions for generating formatted content
function generatePersonaHTML(persona: Persona | EnhancedPersona): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
        ${persona.name}
      </h1>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;">
        <div><strong>Âge:</strong> ${persona.age} ans</div>
        <div><strong>Localisation:</strong> ${persona.location}</div>
      </div>
      
      <div style="margin: 16px 0;">
        <h3 style="color: #374151; margin-bottom: 8px;">Bio</h3>
        <p style="background: #f9fafb; padding: 12px; border-radius: 6px; margin: 0;">
          ${persona.bio}
        </p>
      </div>
      
      <div style="margin: 16px 0;">
        <h3 style="color: #374151; margin-bottom: 8px;">Citation</h3>
        <blockquote style="font-style: italic; border-left: 4px solid #2563eb; padding-left: 16px; margin: 0;">
          "${persona.quote}"
        </blockquote>
      </div>
      
      <div style="margin: 16px 0;">
        <h3 style="color: #374151; margin-bottom: 8px;">Valeurs</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${persona.values.map(value => `<li>${value}</li>`).join('')}
        </ul>
      </div>
      
      <div style="margin: 16px 0;">
        <h3 style="color: #374151; margin-bottom: 8px;">Intérêts</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div><strong>Musique:</strong> ${persona.interests.music.join(', ')}</div>
          <div><strong>Marques:</strong> ${persona.interests.brands.join(', ')}</div>
          <div><strong>Films:</strong> ${persona.interests.movies.join(', ')}</div>
          <div><strong>Cuisine:</strong> ${persona.interests.food.join(', ')}</div>
        </div>
      </div>
      
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        Généré par PersonaCraft le ${new Date(persona.generatedAt).toLocaleDateString('fr-FR')}
      </div>
    </div>
  `;
}

function generatePersonaText(persona: Persona | EnhancedPersona): string {
  return `${persona.name}

Âge: ${persona.age} ans
Localisation: ${persona.location}

Bio: ${persona.bio}

Citation: "${persona.quote}"

Valeurs:
${persona.values.map(value => `• ${value}`).join('\n')}

Intérêts:
• Musique: ${persona.interests.music.join(', ')}
• Marques: ${persona.interests.brands.join(', ')}
• Films: ${persona.interests.movies.join(', ')}
• Cuisine: ${persona.interests.food.join(', ')}

Communication:
• Canaux préférés: ${persona.communication.preferredChannels.join(', ')}
• Ton: ${persona.communication.tone}
• Types de contenu: ${persona.communication.contentTypes.join(', ')}

Marketing:
• Points de douleur: ${persona.marketing.painPoints.join(', ')}
• Motivations: ${persona.marketing.motivations.join(', ')}
• Comportement d'achat: ${persona.marketing.buyingBehavior}

Généré le ${new Date(persona.generatedAt).toLocaleDateString('fr-FR')} par PersonaCraft`;
}