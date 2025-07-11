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
  ExternalLink
} from 'lucide-react';
import { Persona } from '@/lib/types/persona';
import { exportToPDF, exportToCSV } from '@/lib/utils/export';

interface PersonaExportProps {
  persona?: Persona;
  personas?: Persona[];
  variant?: 'single' | 'multiple';
}

export function PersonaExport({ persona, personas, variant = 'single' }: PersonaExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async (format: 'pdf' | 'csv') => {
    setIsExporting(true);
    try {
      if (format === 'pdf' && persona) {
        await exportToPDF(persona);
      } else if (format === 'csv') {
        const dataToExport = personas || (persona ? [persona] : []);
        await exportToCSV(dataToExport);
      }
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setIsExporting(false);
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

  if (variant === 'multiple') {
    return (
      <div className="flex space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isExporting}>
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exporter tout
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <Table className="h-4 w-4 mr-2" />
              Exporter en CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {exportSuccess && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Export réussi!</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      {/* Bouton d'export */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isExporting}>
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exporter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Exporter en PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <Table className="h-4 w-4 mr-2" />
            Exporter en CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bouton de partage */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partager ce persona</DialogTitle>
            <DialogDescription>
              Partagez ce persona avec votre équipe ou sur les réseaux sociaux
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Lien partageable */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Lien partageable</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={generateShareableLink()}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateShareableLink())}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600">Lien copié dans le presse-papiers!</p>
              )}
            </div>

            {/* Options de partage */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Partager via</label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={shareViaEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm" onClick={shareViaLinkedIn}>
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <Button variant="outline" size="sm" onClick={shareViaTwitter}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Slack
                </Button>
              </div>
            </div>

            {/* Informations du persona */}
            {persona && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {persona.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{persona.name}</h4>
                    <p className="text-xs text-gray-600">{persona.age} ans • {persona.location}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {persona.values.slice(0, 3).map(value => (
                    <Badge key={value} variant="secondary" className="text-xs">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Indicateur de succès */}
      {exportSuccess && (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Export réussi!</span>
        </div>
      )}
    </div>
  );
}