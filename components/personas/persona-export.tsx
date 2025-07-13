'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  FileText, 
  Table, 
  Share2, 
  Copy, 
  Mail, 
  MessageSquare,
  Linkedin,
  Twitter,
  CheckCircle,
  ExternalLink,
  Loader2,
  Sparkles,
  Zap,
  Globe,
  Smartphone,
  Users,
  ArrowRight,
  Star,
  Award,
  Clock,
  BarChart3,
  Activity,
  Link,
  MapPin,
  Lightbulb
} from 'lucide-react';
import { Persona } from '@/lib/types/persona';
import { useExport } from '@/hooks/use-export';
import { cn } from '@/lib/utils';

interface PersonaExportProps {
  persona?: Persona;
  personas?: Persona[];
  variant?: 'single' | 'multiple';
  size?: 'sm' | 'md' | 'lg';
}

export function PersonaExport({ 
  persona, 
  personas, 
  variant = 'single',
  size = 'md'
}: PersonaExportProps) {
  const { 
    exportState, 
    exportPersona, 
    exportPersonas,
    resetExportState 
  } = useExport();
  
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async (format: 'pdf' | 'csv') => {
    resetExportState();
    
    try {
      if (format === 'pdf' && persona) {
        await exportPersona(persona, { format: 'pdf' });
      } else if (format === 'csv') {
        const dataToExport = personas || (persona ? [persona] : []);
        await exportPersonas(dataToExport, { format: 'csv' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  const generateShareableLink = () => {
    if (!persona) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/personas/${persona.id}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Persona: ${persona?.name || 'Personas générés'}`);
    const body = encodeURIComponent(
      `Découvrez ce persona généré avec PersonaCraft:\n\n${generateShareableLink()}\n\nGénéré avec PersonaCraft - https://personacraft.com`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaLinkedIn = () => {
    const url = encodeURIComponent(generateShareableLink());
    const text = encodeURIComponent(`Découvrez ce persona détaillé généré avec PersonaCraft`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`);
  };

  const shareViaTwitter = () => {
    const url = encodeURIComponent(generateShareableLink());
    const text = encodeURIComponent(`Découvrez ce persona généré avec PersonaCraft 🎯 #Marketing #Personas`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const sizeClasses = {
    sm: {
      button: "h-8 px-3 text-xs",
      icon: "h-3 w-3",
      progress: "w-16",
      text: "text-xs"
    },
    md: {
      button: "h-10 px-4 text-sm",
      icon: "h-4 w-4",
      progress: "w-24",
      text: "text-sm"
    },
    lg: {
      button: "h-12 px-6 text-base",
      icon: "h-5 w-5",
      progress: "w-32",
      text: "text-base"
    }
  };

  if (variant === 'multiple') {
    return (
      <div className="flex items-center gap-3">
              <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              disabled={exportState.status === 'generating'}
              className={cn(
                "hover-lift transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
                "border-primary-200 dark:border-primary-700 hover:border-primary-300 dark:hover:border-primary-600",
                sizeClasses[size].button
              )}
            >
            {exportState.status === 'generating' ? (
                <Loader2 className={cn("mr-2 animate-spin", sizeClasses[size].icon)} />
            ) : (
                <Download className={cn("mr-2", sizeClasses[size].icon)} />
            )}
            Exporter tout
          </Button>
        </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 shadow-xl">
            <DropdownMenuItem 
              onClick={() => handleExport('csv')}
              className="flex items-center gap-3 p-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                <Table className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Exporter en CSV</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Format tabulaire pour Excel</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Indicateurs d'état avec design moderne */}
        {exportState.status === 'generating' && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="p-1 bg-blue-100 dark:bg-blue-800/50 rounded-full">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={cn("font-medium text-blue-700 dark:text-blue-300", sizeClasses[size].text)}>
                  Génération en cours...
                </span>
                <span className={cn("font-bold text-blue-700 dark:text-blue-300", sizeClasses[size].text)}>
                  {exportState.progress}%
                </span>
              </div>
              <Progress 
                value={exportState.progress} 
                className={cn("h-2 bg-blue-200 dark:bg-blue-800", sizeClasses[size].progress)}
              />
            </div>
          </div>
        )}
        
        {exportState.status === 'success' && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
            <div className="p-1 bg-green-100 dark:bg-green-800/50 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className={cn("font-medium text-green-700 dark:text-green-300", sizeClasses[size].text)}>
              Export réussi !
            </span>
          </div>
        )}
        
        {exportState.status === 'error' && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-700">
            <div className="p-1 bg-red-100 dark:bg-red-800/50 rounded-full">
              <Zap className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <span className={cn("font-medium text-red-700 dark:text-red-300", sizeClasses[size].text)}>
              Erreur: {exportState.error}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Bouton d'export avec design moderne */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            disabled={exportState.status === 'generating'}
            className={cn(
              "hover-lift transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
              "border-primary-200 dark:border-primary-700 hover:border-primary-300 dark:hover:border-primary-600",
              sizeClasses[size].button
            )}
          >
            {exportState.status === 'generating' ? (
              <Loader2 className={cn("mr-2 animate-spin", sizeClasses[size].icon)} />
            ) : (
              <Download className={cn("mr-2", sizeClasses[size].icon)} />
            )}
            Exporter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 shadow-xl">
          <DropdownMenuItem 
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-3 p-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-lg">
              <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Exporter en PDF</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Document formaté et imprimable</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
          <DropdownMenuItem 
            onClick={() => handleExport('csv')}
            className="flex items-center gap-3 p-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
              <Table className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Exporter en CSV</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Format tabulaire pour Excel</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bouton de partage avec design moderne */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline"
            className={cn(
              "hover-lift transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
              "border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600",
              sizeClasses[size].button
            )}
          >
            <Share2 className={cn("mr-2", sizeClasses[size].icon)} />
            Partager
          </Button>
        </DialogTrigger>
        
        <DialogContent className="w-[95vw] max-w-sm sm:max-w-md bg-white dark:bg-gray-900 border-0 shadow-xl">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              Partager ce persona
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Partagez avec votre équipe ou sur les réseaux
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4">
            {/* Aperçu compact du persona */}
            {persona && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    {getInitials(persona.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{persona.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {persona.age} ans • {persona.location}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    Premium
                  </Badge>
                </div>
              </div>
            )}

            {/* Lien partageable compact */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Lien partageable
              </label>
              <div className="flex gap-1 sm:gap-2">
                <input
                  type="text"
                  value={generateShareableLink()}
                  readOnly
                  className="flex-1 px-2 sm:px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none text-gray-900 dark:text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateShareableLink())}
                  className="px-2 sm:px-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Copié !
                </p>
              )}
            </div>

            {/* Options de partage compactes */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Partager via
              </label>
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={shareViaEmail}
                  className="flex items-center gap-1 sm:gap-2 justify-start p-1.5 sm:p-2 h-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs">Email</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={shareViaLinkedIn}
                  className="flex items-center gap-1 sm:gap-2 justify-start p-1.5 sm:p-2 h-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <Linkedin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-700 dark:text-blue-400" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={shareViaTwitter}
                  className="flex items-center gap-1 sm:gap-2 justify-start p-1.5 sm:p-2 h-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <Twitter className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                  <span className="text-xs">Twitter</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 sm:gap-2 justify-start p-1.5 sm:p-2 h-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs">Slack</span>
                </Button>
              </div>
            </div>

            {/* Note compacte */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-2 sm:p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 Le lien reste accessible pendant 30 jours
              </p>
              </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Indicateurs d'état avec design moderne */}
             {exportState.status === 'generating' && (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
          <div className="p-1 bg-blue-100 dark:bg-blue-800/50 rounded-full">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className={cn("font-medium text-blue-700 dark:text-blue-300", sizeClasses[size].text)}>
                Génération en cours...
              </span>
              <span className={cn("font-bold text-blue-700 dark:text-blue-300", sizeClasses[size].text)}>
                {exportState.progress}%
              </span>
            </div>
            <Progress 
              value={exportState.progress} 
              className={cn("h-2 bg-blue-200 dark:bg-blue-800", sizeClasses[size].progress)}
            />
          </div>
        </div>
      )}
      
      {exportState.status === 'success' && (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
          <div className="p-1 bg-green-100 dark:bg-green-800/50 rounded-full">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <span className={cn("font-medium text-green-700 dark:text-green-300", sizeClasses[size].text)}>
            Export réussi !
          </span>
        </div>
      )}
      
      {exportState.status === 'error' && (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-700">
          <div className="p-1 bg-red-100 dark:bg-red-800/50 rounded-full">
            <Zap className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <span className={cn("font-medium text-red-700 dark:text-red-300", sizeClasses[size].text)}>
            Erreur: {exportState.error}
          </span>
        </div>
      )}
    </div>
  );
}