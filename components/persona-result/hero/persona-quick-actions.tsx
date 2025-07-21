'use client';

import * as React from 'react';
import { Persona, EnhancedPersona } from '@/lib/types/persona';
import { cn } from '@/lib/utils';
import { GradientButton, GradientButtonGroup } from '../ui/gradient-button';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Share2, 
  ArrowLeft, 
  Copy, 
  FileText, 
  Image as ImageIcon,
  Mail,
  Link,
  MoreHorizontal,
  Printer,
  Heart,
  Bookmark,
  QrCode,
  Code,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePersonaSharing, useClipboard } from '@/hooks/use-persona-sharing';
import { PersonaExport } from '@/components/personas/persona-export';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface PersonaQuickActionsProps {
  persona: Persona | EnhancedPersona;
  onExport?: () => void;
  onShare?: () => void;
  onBack?: () => void;
  compact?: boolean;
  className?: string;
}

export function PersonaQuickActions({
  persona,
  onExport,
  onShare,
  onBack,
  compact = false,
  className,
}: PersonaQuickActionsProps) {
  const { toast } = useToast();
  const { sharePersona, shareState, isSharing, copyToClipboard } = usePersonaSharing();
  const { copyPersonaData } = useClipboard();
  
  const [showShareDialog, setShowShareDialog] = React.useState(false);
  const [shareOptions, setShareOptions] = React.useState({
    method: 'link' as const,
    expiresIn: 24,
    allowDownload: true,
    customMessage: ''
  });

  const handleExport = async () => {
    if (onExport) {
      await onExport();
      return;
    }
    // Export logic is handled by PersonaExport component
  };

  const handleShare = async (method?: 'link' | 'email' | 'social') => {
    if (onShare) {
      await onShare();
      return;
    }

    if (method) {
      await sharePersona(persona, { method });
    } else {
      setShowShareDialog(true);
    }
  };

  const handleAdvancedShare = async () => {
    await sharePersona(persona, shareOptions);
    setShowShareDialog(false);
  };

  const handleCopyData = async (format: 'text' | 'html' | 'json' = 'text') => {
    await copyPersonaData(persona, format);
  };

  const handlePrint = () => {
    // Add print-specific class to body
    document.body.classList.add('printing');
    
    // Load print styles if not already loaded
    if (!document.querySelector('#print-styles')) {
      const link = document.createElement('link');
      link.id = 'print-styles';
      link.rel = 'stylesheet';
      link.href = '/styles/persona-print.css';
      document.head.appendChild(link);
    }
    
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing');
    }, 100);
  };

  const handleSave = () => {
    // Save to localStorage favorites
    const favorites = JSON.parse(localStorage.getItem('persona-favorites') || '[]');
    const isAlreadyFavorite = favorites.some((fav: any) => fav.id === persona.id);
    
    if (!isAlreadyFavorite) {
      favorites.push({
        id: persona.id,
        name: persona.name,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('persona-favorites', JSON.stringify(favorites));
      
      toast({
        title: "Persona sauvegardé",
        description: `${persona.name} a été ajouté à vos favoris.`,
      });
    } else {
      toast({
        title: "Déjà sauvegardé",
        description: `${persona.name} est déjà dans vos favoris.`,
      });
    }
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <PersonaExport persona={persona} size="sm" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleShare()}>
              <Share2 className="mr-2 h-4 w-4" />
              Partager
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSave}>
              <Bookmark className="mr-2 h-4 w-4" />
              Sauvegarder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Full layout for non-compact mode
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Primary Actions */}
      <div className="flex items-center gap-3">
        <PersonaExport persona={persona} size="md" />
        
        <GradientButton
          variant="secondary"
          onClick={() => handleShare()}
          loading={isSharing}
          icon={<Share2 className="h-4 w-4" />}
        >
          Partager
        </GradientButton>
        
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        )}
      </div>

      {/* Share Options */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopyData('text')}
        >
          <Copy className="mr-2 h-3 w-3" />
          Copier texte
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopyData('html')}
        >
          <Code className="mr-2 h-3 w-3" />
          Copier HTML
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('email')}
          disabled={isSharing}
        >
          <Mail className="mr-2 h-3 w-3" />
          Email
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
        >
          <Printer className="mr-2 h-3 w-3" />
          Imprimer
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
        >
          <Heart className="mr-2 h-3 w-3" />
          Favoris
        </Button>
      </div>



      {/* Advanced Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Options de partage</DialogTitle>
            <DialogDescription>
              Créez un lien sécurisé pour partager votre persona
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-method">Méthode</Label>
              <select
                id="share-method"
                className="w-full p-2 border rounded-md"
                value={shareOptions.method}
                onChange={(e) => setShareOptions(prev => ({ 
                  ...prev, 
                  method: e.target.value as any 
                }))}
              >
                <option value="link">Lien sécurisé</option>
                <option value="email">Email</option>
                <option value="social">Réseaux sociaux</option>
                <option value="qr">QR Code</option>
                <option value="embed">Code d'intégration</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires-in">Expiration (heures)</Label>
              <Input
                id="expires-in"
                type="number"
                min="1"
                max="168"
                value={shareOptions.expiresIn}
                onChange={(e) => setShareOptions(prev => ({ 
                  ...prev, 
                  expiresIn: parseInt(e.target.value) || 24 
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-message">Message personnalisé</Label>
              <Textarea
                id="custom-message"
                placeholder="Ajoutez un message personnalisé..."
                value={shareOptions.customMessage}
                onChange={(e) => setShareOptions(prev => ({ 
                  ...prev, 
                  customMessage: e.target.value 
                }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="allow-download"
                checked={shareOptions.allowDownload}
                onCheckedChange={(checked) => setShareOptions(prev => ({ 
                  ...prev, 
                  allowDownload: checked 
                }))}
              />
              <Label htmlFor="allow-download">Autoriser le téléchargement</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleAdvancedShare}
                disabled={isSharing}
                className="flex-1"
              >
                {isSharing ? 'Partage...' : 'Créer le lien'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowShareDialog(false)}
                disabled={isSharing}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Result Dialog */}
      {shareState.status === 'success' && shareState.shareUrl && (
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Lien de partage créé</DialogTitle>
              <DialogDescription>
                Votre persona peut maintenant être partagé
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Lien de partage</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareState.shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(shareState.shareUrl!, 'Lien de partage')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {shareState.qrCode && (
                <div className="space-y-2">
                  <Label>QR Code</Label>
                  <div className="flex justify-center">
                    <img 
                      src={shareState.qrCode} 
                      alt="QR Code" 
                      className="w-32 h-32 border rounded"
                    />
                  </div>
                </div>
              )}

              {shareState.embedCode && (
                <div className="space-y-2">
                  <Label>Code d'intégration</Label>
                  <Textarea
                    value={shareState.embedCode}
                    readOnly
                    className="font-mono text-xs"
                    rows={4}
                  />
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(shareState.embedCode!, 'Code d\'intégration')}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copier le code
                  </Button>
                </div>
              )}

              {shareState.expiresAt && (
                <div className="text-sm text-muted-foreground">
                  <Badge variant="outline">
                    Expire le {new Date(shareState.expiresAt).toLocaleDateString('fr-FR')}
                  </Badge>
                </div>
              )}

              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}