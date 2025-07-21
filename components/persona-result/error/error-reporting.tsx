'use client';

import React, { useState, useCallback } from 'react';
import { Send, Bug, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ErrorReport {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  timestamp: string;
  userDescription?: string;
  reproductionSteps?: string;
  includeSystemInfo: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorReportingProps {
  error: Error;
  errorId: string;
  componentStack?: string;
  onReportSent?: (reportId: string) => void;
}

export const ErrorReporting: React.FC<ErrorReportingProps> = ({
  error,
  errorId,
  componentStack,
  onReportSent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userDescription, setUserDescription] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [includeSystemInfo, setIncludeSystemInfo] = useState(true);
  const [severity, setSeverity] = useState<ErrorReport['severity']>('medium');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const report: ErrorReport = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userDescription: userDescription.trim(),
        reproductionSteps: reproductionSteps.trim(),
        includeSystemInfo,
        severity,
      };

      // In a real application, you would send this to your error reporting service
      const reportId = await submitErrorReport(report);
      
      setIsSubmitted(true);
      onReportSent?.(reportId);
      
      toast.success('Rapport d\'erreur envoyé avec succès', {
        description: `ID du rapport: ${reportId}`,
      });

      // Close dialog after a delay
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
      }, 2000);

    } catch (submitError) {
      console.error('Failed to submit error report:', submitError);
      toast.error('Échec de l\'envoi du rapport', {
        description: 'Veuillez réessayer plus tard.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [errorId, error, componentStack, userDescription, reproductionSteps, includeSystemInfo, severity, onReportSent]);

  const getSeverityColor = (sev: ErrorReport['severity']) => {
    switch (sev) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    }
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Bug className="mr-2 h-4 w-4" />
            Signaler l'erreur
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Rapport envoyé !</h3>
            <p className="text-muted-foreground">
              Merci pour votre retour. Notre équipe va examiner ce problème.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bug className="mr-2 h-4 w-4" />
          Signaler l'erreur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Signaler une erreur
          </DialogTitle>
          <DialogDescription>
            Aidez-nous à améliorer PersonaCraft en signalant cette erreur.
            Vos informations nous aideront à résoudre le problème plus rapidement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Résumé de l'erreur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ID d'erreur:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {errorId}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium">Message:</span>
                <code className="block mt-1 p-2 bg-muted rounded text-xs">
                  {error.message}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="severity">Gravité perçue:</Label>
                <div className="flex gap-1">
                  {(['low', 'medium', 'high', 'critical'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        severity === sev 
                          ? getSeverityColor(sev)
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {sev === 'low' && 'Faible'}
                      {sev === 'medium' && 'Moyenne'}
                      {sev === 'high' && 'Élevée'}
                      {sev === 'critical' && 'Critique'}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Que faisiez-vous quand l'erreur s'est produite ? (optionnel)
            </Label>
            <Textarea
              id="description"
              placeholder="Décrivez ce que vous étiez en train de faire..."
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Reproduction steps */}
          <div className="space-y-2">
            <Label htmlFor="steps">
              Étapes pour reproduire l'erreur (optionnel)
            </Label>
            <Textarea
              id="steps"
              placeholder="1. Aller sur la page...&#10;2. Cliquer sur...&#10;3. L'erreur apparaît..."
              value={reproductionSteps}
              onChange={(e) => setReproductionSteps(e.target.value)}
              rows={4}
            />
          </div>

          {/* System info checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="systemInfo"
              checked={includeSystemInfo}
              onCheckedChange={(checked) => setIncludeSystemInfo(checked as boolean)}
            />
            <Label htmlFor="systemInfo" className="text-sm">
              Inclure les informations système (navigateur, OS, etc.)
            </Label>
          </div>

          {/* Privacy notice */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Confidentialité:</strong> Ce rapport contient des informations techniques 
              sur l'erreur. Aucune donnée personnelle de vos personas ne sera incluse.
            </AlertDescription>
          </Alert>

          {/* Submit button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer le rapport
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// User feedback component for general feedback
interface UserFeedbackProps {
  context?: string;
  onFeedbackSent?: (feedback: UserFeedback) => void;
}

interface UserFeedback {
  type: 'bug' | 'feature' | 'improvement' | 'other';
  message: string;
  context?: string;
  timestamp: string;
  url: string;
}

export const UserFeedback: React.FC<UserFeedbackProps> = ({
  context,
  onFeedbackSent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState<UserFeedback['type']>('improvement');
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    try {
      const feedback: UserFeedback = {
        type: feedbackType,
        message: message.trim(),
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };

      await submitUserFeedback(feedback);
      
      onFeedbackSent?.(feedback);
      toast.success('Merci pour votre retour !');
      
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      toast.error('Échec de l\'envoi du feedback');
    } finally {
      setIsSubmitting(false);
    }
  }, [feedbackType, message, context, onFeedbackSent]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Votre avis nous intéresse</DialogTitle>
          <DialogDescription>
            Partagez vos suggestions pour améliorer PersonaCraft.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type de retour</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'bug', label: 'Bug' },
                { value: 'feature', label: 'Nouvelle fonctionnalité' },
                { value: 'improvement', label: 'Amélioration' },
                { value: 'other', label: 'Autre' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFeedbackType(value as UserFeedback['type'])}
                  className={`p-2 text-sm rounded border transition-colors ${
                    feedbackType === value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-message">Votre message</Label>
            <Textarea
              id="feedback-message"
              placeholder="Décrivez votre suggestion ou problème..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Mock functions for API calls (replace with real implementations)
async function submitErrorReport(report: ErrorReport): Promise<string> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, send to your error reporting service
  console.log('Error report submitted:', report);
  
  return `ER_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

async function submitUserFeedback(feedback: UserFeedback): Promise<void> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In production, send to your feedback collection service
  console.log('User feedback submitted:', feedback);
}