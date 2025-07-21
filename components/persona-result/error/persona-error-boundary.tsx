'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: string[];
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  retryCount: number;
  errorId: string;
}

export class PersonaErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for monitoring
    this.logError(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys have changed
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      
      if (hasResetKeyChanged) {
        this.resetError();
      }
    }

    // Reset on any prop change if enabled
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetError();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 PersonaErrorBoundary caught an error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }

    // In production, you would send this to your error reporting service
    // Example: Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // sendErrorToService(errorData);
    }
  };

  private resetError = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: prevState.retryCount + 1,
    }));
  };

  private handleRetry = () => {
    this.resetError();
  };

  private handleRetryWithDelay = (delay: number = 1000) => {
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetError();
    }, delay);
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.handleRetry}
          retryCount={this.state.retryCount}
          errorId={this.state.errorId}
        />
      );
    }

    return this.props.children;
  }
}

// Default fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  retryCount,
  errorId,
}) => {
  const isRecurringError = retryCount > 2;
  
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">
            {isRecurringError ? 'Erreur persistante' : 'Une erreur est survenue'}
          </CardTitle>
          <CardDescription>
            {isRecurringError 
              ? 'Cette erreur continue de se produire. Veuillez rafraîchir la page ou contacter le support.'
              : 'Nous avons rencontré un problème lors de l\'affichage de ce persona.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert>
              <Bug className="h-4 w-4" />
              <AlertTitle>Détails de l'erreur</AlertTitle>
              <AlertDescription className="mt-2">
                <code className="text-sm bg-muted p-2 rounded block overflow-x-auto">
                  {error.message}
                </code>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>ID d'erreur: {errorId}</span>
            {retryCount > 0 && (
              <Badge variant="outline">
                Tentative {retryCount}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2 pt-4">
            {!isRecurringError && (
              <Button onClick={resetError} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && errorInfo && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium">
                Stack trace (développement)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                {errorInfo.componentStack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Specialized error fallbacks for different contexts
export const PersonaLoadErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  retryCount,
}) => (
  <div className="flex items-center justify-center min-h-[200px] p-4">
    <div className="text-center space-y-4">
      <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
      <div>
        <h3 className="font-semibold">Impossible de charger le persona</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {error?.message || 'Une erreur est survenue lors du chargement des données.'}
        </p>
      </div>
      <Button onClick={resetError} size="sm">
        <RefreshCw className="mr-2 h-4 w-4" />
        Réessayer
      </Button>
    </div>
  </div>
);

export const PersonaRenderErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
}) => (
  <Alert className="my-4">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Erreur d'affichage</AlertTitle>
    <AlertDescription className="mt-2">
      Cette section ne peut pas être affichée correctement.
      <Button 
        variant="link" 
        size="sm" 
        onClick={resetError}
        className="ml-2 h-auto p-0"
      >
        Réessayer
      </Button>
    </AlertDescription>
  </Alert>
);