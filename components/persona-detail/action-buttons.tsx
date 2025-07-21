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
  Twitter, 
  Link as LinkIcon,
  Mail
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface ActionButtonsProps {
  personaId: string;
  onBack: () => void;
  onExport: (format?: 'pdf' | 'csv' | 'json') => void;
  onShare: (method?: 'twitter' | 'email' | 'link') => void;
}

/**
 * Composant pour les boutons d'action principaux avec accessibilité améliorée
 * et optimisation pour les interactions tactiles
 */
export function ActionButtons({ personaId, onBack, onExport, onShare }: ActionButtonsProps) {
  const [copiedId, setCopiedId] = useState(false);
  
  const copyPersonaId = async () => {
    try {
      await navigator.clipboard.writeText(personaId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 w-full">
      {/* Bouton de retour avec accessibilité améliorée */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                onClick={onBack} 
                className="flex items-center gap-2 hover:translate-y-[-2px] transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-200 hover:text-primary-700 dark:hover:text-primary-300 persona-action-button min-h-11"
                aria-label="Retour à la liste des personas"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Retour à la liste</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Retourner à la liste des personas</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Groupe de boutons d'action avec accessibilité améliorée */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* Bouton Copier ID */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyPersonaId}
                className="flex items-center gap-2 hover:translate-y-[-2px] transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 persona-action-button min-h-11"
                aria-label={copiedId ? "ID copié" : "Copier l'ID du persona"}
              >
                {copiedId ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="font-medium">Copier ID</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copier l'identifiant unique du persona</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Menu déroulant pour l'export avec options */}
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2 hover:translate-y-[-2px] transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm persona-action-button min-h-11"
                    aria-label="Exporter le persona"
                  >
                    <Download className="h-4 w-4" />
                    <span className="font-medium">Exporter</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exporter le persona dans différents formats</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Format d'export</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onExport('pdf')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <File className="h-4 w-4 text-error-DEFAULT" />
              <span>PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onExport('csv')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4 text-success-DEFAULT" />
              <span>CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onExport('json')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <FileJson className="h-4 w-4 text-primary-600" />
              <span>JSON</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Menu déroulant pour le partage avec options */}
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2 hover:translate-y-[-2px] transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm persona-action-button min-h-11"
                    aria-label="Partager le persona"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="font-medium">Partager</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Partager le persona via différents canaux</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Options de partage</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onShare('twitter')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Twitter className="h-4 w-4 text-[#1DA1F2]" />
              <span>Twitter</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onShare('email')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Mail className="h-4 w-4 text-accent-600" />
              <span>Email</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onShare('link')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <LinkIcon className="h-4 w-4 text-secondary-600" />
              <span>Copier le lien</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}