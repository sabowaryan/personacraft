'use client';

import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  CheckCircle, 
  Copy, 
  Download, 
  FileJson, 
  File, 
  FileText, 
  Share2, 
  X as TwitterIcon, 
  Link as LinkIcon,
  Mail
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface ActionButtonsProps {
  personaId: string;
  onBack: () => void;
  onExport: (format?: 'pdf' | 'csv' | 'json') => void;
  onShare: (method?: 'twitter' | 'email' | 'link') => void;
}

/**
 * Composant pour les boutons d'action principaux avec accessibilité améliorée
 * et optimisation pour les interactions tactiles sur mobile
 */
export function ActionButtons({ personaId, onBack, onExport, onShare }: ActionButtonsProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  
  // Gestion du focus pour l'accessibilité
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExportOpen(false);
        setIsShareOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const copyPersonaId = async () => {
    try {
      await navigator.clipboard.writeText(personaId);
      setCopiedId(true);
      // Annonce vocale pour les lecteurs d'écran
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'ID du persona copié dans le presse-papiers';
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        setCopiedId(false);
        document.body.removeChild(announcement);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      // Annonce d'erreur pour les lecteurs d'écran
      const errorAnnouncement = document.createElement('div');
      errorAnnouncement.setAttribute('aria-live', 'assertive');
      errorAnnouncement.setAttribute('aria-atomic', 'true');
      errorAnnouncement.className = 'sr-only';
      errorAnnouncement.textContent = 'Erreur lors de la copie de l\'ID';
      document.body.appendChild(errorAnnouncement);
      
      setTimeout(() => {
        document.body.removeChild(errorAnnouncement);
      }, 3000);
    }
  };

  const handleExportAction = (format: 'pdf' | 'csv' | 'json') => {
    onExport(format);
    setIsExportOpen(false);
    // Retour du focus au bouton d'export
    setTimeout(() => exportButtonRef.current?.focus(), 100);
  };

  const handleShareAction = (method: 'twitter' | 'email' | 'link') => {
    onShare(method);
    setIsShareOpen(false);
    // Retour du focus au bouton de partage
    setTimeout(() => shareButtonRef.current?.focus(), 100);
  };

  return (
    <nav 
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 w-full"
      role="navigation"
      aria-label="Actions du persona"
    >
      {/* Bouton de retour avec accessibilité améliorée */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                ref={backButtonRef}
                variant="outline" 
                onClick={onBack} 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-3",
                  "min-h-[44px] min-w-[44px]", // Taille tactile minimum 44px
                  "hover:translate-y-[-2px] transition-all duration-300",
                  "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
                  "border-gray-200 dark:border-gray-700",
                  "hover:border-primary-300 dark:hover:border-primary-600",
                  "text-gray-700 dark:text-gray-200",
                  "hover:text-primary-700 dark:hover:text-primary-300",
                  "focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                  "focus:outline-none",
                  "persona-action-button",
                  "touch-manipulation" // Optimisation tactile
                )}
                aria-label="Retour à la liste des personas"
                aria-describedby="back-button-description"
              >
                <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
                <span className="font-medium text-sm sm:text-base">Retour à la liste</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p id="back-button-description">Retourner à la liste des personas</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Groupe de boutons d'action avec accessibilité améliorée */}
      <div 
        className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end"
        role="group"
        aria-label="Actions sur le persona"
      >
        {/* Bouton Copier ID */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyPersonaId}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2",
                  "min-h-[44px] min-w-[44px]", // Taille tactile minimum
                  "hover:translate-y-[-2px] transition-all duration-300",
                  "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
                  "border-gray-200 dark:border-gray-700",
                  "text-gray-700 dark:text-gray-200",
                  "focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                  "focus:outline-none",
                  "persona-action-button",
                  "touch-manipulation",
                  copiedId && "border-green-300 dark:border-green-600"
                )}
                aria-label={copiedId ? "ID copié dans le presse-papiers" : "Copier l'ID du persona"}
                aria-describedby="copy-button-description"
                disabled={copiedId}
              >
                {copiedId ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
                    <span className="text-green-600 dark:text-green-400 font-medium text-xs sm:text-sm">
                      Copié !
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    <span className="font-medium text-xs sm:text-sm hidden sm:inline">
                      Copier ID
                    </span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p id="copy-button-description">
                {copiedId ? "ID copié !" : "Copier l'identifiant unique du persona"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Menu déroulant pour l'export avec options */}
        <DropdownMenu open={isExportOpen} onOpenChange={setIsExportOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    ref={exportButtonRef}
                    variant="outline" 
                    size="sm"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2",
                      "min-h-[44px] min-w-[44px]", // Taille tactile minimum
                      "hover:translate-y-[-2px] transition-all duration-300",
                      "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
                      "focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                      "focus:outline-none",
                      "persona-action-button",
                      "touch-manipulation"
                    )}
                    aria-label="Exporter le persona"
                    aria-describedby="export-button-description"
                    aria-expanded={isExportOpen}
                    aria-haspopup="menu"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span className="font-medium text-xs sm:text-sm hidden sm:inline">
                      Exporter
                    </span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p id="export-button-description">Exporter le persona dans différents formats</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuContent 
            align="end" 
            className="w-48 sm:w-56"
            role="menu"
            aria-label="Options d'export"
          >
            <DropdownMenuLabel>Format d'export</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleExportAction('pdf')}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                "min-h-[44px] px-4 py-3", // Taille tactile
                "focus:bg-primary-50 dark:focus:bg-primary-900/20",
                "touch-manipulation"
              )}
              role="menuitem"
              aria-label="Exporter en format PDF"
            >
              <File className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
              <span className="font-medium">PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleExportAction('csv')}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                "min-h-[44px] px-4 py-3", // Taille tactile
                "focus:bg-primary-50 dark:focus:bg-primary-900/20",
                "touch-manipulation"
              )}
              role="menuitem"
              aria-label="Exporter en format CSV"
            >
              <FileText className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
              <span className="font-medium">CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleExportAction('json')}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                "min-h-[44px] px-4 py-3", // Taille tactile
                "focus:bg-primary-50 dark:focus:bg-primary-900/20",
                "touch-manipulation"
              )}
              role="menuitem"
              aria-label="Exporter en format JSON"
            >
              <FileJson className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="font-medium">JSON</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Menu déroulant pour le partage avec options */}
        <DropdownMenu open={isShareOpen} onOpenChange={setIsShareOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    ref={shareButtonRef}
                    variant="outline" 
                    size="sm"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2",
                      "min-h-[44px] min-w-[44px]", // Taille tactile minimum
                      "hover:translate-y-[-2px] transition-all duration-300",
                      "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
                      "focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                      "focus:outline-none",
                      "persona-action-button",
                      "touch-manipulation"
                    )}
                    aria-label="Partager le persona"
                    aria-describedby="share-button-description"
                    aria-expanded={isShareOpen}
                    aria-haspopup="menu"
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    <span className="font-medium text-xs sm:text-sm hidden sm:inline">
                      Partager
                    </span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p id="share-button-description">Partager le persona via différents canaux</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuContent 
            align="end" 
            className="w-48 sm:w-56"
            role="menu"
            aria-label="Options de partage"
          >
            <DropdownMenuLabel>Options de partage</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleShareAction('twitter')}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                "min-h-[44px] px-4 py-3", // Taille tactile
                "focus:bg-primary-50 dark:focus:bg-primary-900/20",
                "touch-manipulation"
              )}
              role="menuitem"
              aria-label="Partager sur Twitter"
            >
              <TwitterIcon className="h-4 w-4 text-gray-800 dark:text-gray-200" aria-hidden="true" />
              <span className="font-medium">X (Twitter)</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleShareAction('email')}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                "min-h-[44px] px-4 py-3", // Taille tactile
                "focus:bg-primary-50 dark:focus:bg-primary-900/20",
                "touch-manipulation"
              )}
              role="menuitem"
              aria-label="Partager par email"
            >
              <Mail className="h-4 w-4 text-orange-600 dark:text-orange-400" aria-hidden="true" />
              <span className="font-medium">Email</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleShareAction('link')}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                "min-h-[44px] px-4 py-3", // Taille tactile
                "focus:bg-primary-50 dark:focus:bg-primary-900/20",
                "touch-manipulation"
              )}
              role="menuitem"
              aria-label="Copier le lien de partage"
            >
              <LinkIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <span className="font-medium">Copier le lien</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}