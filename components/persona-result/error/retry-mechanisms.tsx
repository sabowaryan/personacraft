'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { RefreshCw, Wifi, WifiOff, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface RetryConfig {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    retryCondition?: (error: Error) => boolean;
}

interface RetryState {
    isRetrying: boolean;
    attemptCount: number;
    lastError: Error | null;
    nextRetryIn: number;
}

interface UseRetryMechanismProps {
    config?: Partial<RetryConfig>;
    onRetry?: (attemptCount: number) => void;
    onMaxAttemptsReached?: (error: Error) => void;
}

// Custom hook for retry logic
export const useRetryMechanism = ({
    config = {},
    onRetry,
    onMaxAttemptsReached,
}: UseRetryMechanismProps = {}) => {
    const finalConfig = useMemo(() => {
        const defaultConfig: RetryConfig = {
            maxAttempts: 3,
            baseDelay: 1000,
            maxDelay: 10000,
            backoffMultiplier: 2,
            retryCondition: (error) => {
                // Retry on network errors, timeouts, and 5xx server errors
                return (
                    error.name === 'NetworkError' ||
                    error.name === 'TimeoutError' ||
                    error.message.includes('fetch') ||
                    error.message.includes('5')
                );
            },
        };
        return { ...defaultConfig, ...config };
    }, [config]);

    const [retryState, setRetryState] = useState<RetryState>({
        isRetrying: false,
        attemptCount: 0,
        lastError: null,
        nextRetryIn: 0,
    });

    const calculateDelay = useCallback((attemptCount: number): number => {
        const delay = Math.min(
            finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attemptCount),
            finalConfig.maxDelay
        );
        // Add jitter to prevent thundering herd
        return delay + Math.random() * 1000;
    }, [finalConfig]);

    const executeWithRetry = useCallback(async <T>(
        operation: () => Promise<T>
    ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt < finalConfig.maxAttempts; attempt++) {
        try {
            setRetryState(prev => ({
                ...prev,
                isRetrying: attempt > 0,
                attemptCount: attempt,
                nextRetryIn: 0,
            }));

            const result = await operation();

            // Reset state on success
            setRetryState({
                isRetrying: false,
                attemptCount: 0,
                lastError: null,
                nextRetryIn: 0,
            });

            return result;
        } catch (error) {
            lastError = error as Error;

            setRetryState(prev => ({
                ...prev,
                lastError,
                attemptCount: attempt + 1,
            }));

            // Check if we should retry this error
            if (!finalConfig.retryCondition?.(lastError)) {
                throw lastError;
            }

            // If this was the last attempt, don't wait
            if (attempt === finalConfig.maxAttempts - 1) {
                break;
            }

            // Calculate delay and wait
            const delay = calculateDelay(attempt);
            onRetry?.(attempt + 1);

            // Countdown timer
            const startTime = Date.now();
            const countdownInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, delay - elapsed);

                setRetryState(prev => ({
                    ...prev,
                    nextRetryIn: Math.ceil(remaining / 1000),
                }));

                if (remaining <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 100);

            await new Promise(resolve => setTimeout(resolve, delay));
            clearInterval(countdownInterval);
        }
    }

    // Max attempts reached
    setRetryState(prev => ({
        ...prev,
        isRetrying: false,
        nextRetryIn: 0,
    }));

    onMaxAttemptsReached?.(lastError!);
    throw lastError!;
}, [finalConfig, calculateDelay, onRetry, onMaxAttemptsReached]);

const reset = useCallback(() => {
    setRetryState({
        isRetrying: false,
        attemptCount: 0,
        lastError: null,
        nextRetryIn: 0,
    });
}, []);

return {
    executeWithRetry,
    retryState,
    reset,
};
};

// Retry UI component
interface RetryUIProps {
    error: Error;
    onRetry: () => void;
    isRetrying: boolean;
    attemptCount: number;
    maxAttempts: number;
    nextRetryIn?: number;
    showDetails?: boolean;
}

export const RetryUI: React.FC<RetryUIProps> = ({
    error,
    onRetry,
    isRetrying,
    attemptCount,
    maxAttempts,
    nextRetryIn = 0,
    showDetails = false,
}) => {
    const isNetworkError = error.name === 'NetworkError' || error.message.includes('fetch');
    const isMaxAttemptsReached = attemptCount >= maxAttempts;

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    {isNetworkError ? (
                        <WifiOff className="h-6 w-6 text-destructive" />
                    ) : (
                        <AlertCircle className="h-6 w-6 text-destructive" />
                    )}
                </div>
                <CardTitle>
                    {isNetworkError ? 'Problème de connexion' : 'Erreur de chargement'}
                </CardTitle>
                <CardDescription>
                    {isNetworkError
                        ? 'Impossible de se connecter au serveur'
                        : 'Une erreur est survenue lors du chargement des données'
                    }
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {showDetails && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Détails de l'erreur</AlertTitle>
                        <AlertDescription className="mt-2">
                            <code className="text-sm bg-muted p-2 rounded block">
                                {error.message}
                            </code>
                        </AlertDescription>
                    </Alert>
                )}

                {attemptCount > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>Tentatives</span>
                            <Badge variant="outline">
                                {attemptCount} / {maxAttempts}
                            </Badge>
                        </div>
                        <Progress value={(attemptCount / maxAttempts) * 100} />
                    </div>
                )}

                {isRetrying && nextRetryIn > 0 && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Nouvelle tentative dans {nextRetryIn}s</span>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        onClick={onRetry}
                        disabled={isRetrying || isMaxAttemptsReached}
                        className="flex-1"
                    >
                        {isRetrying ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Tentative en cours...
                            </>
                        ) : isMaxAttemptsReached ? (
                            'Nombre max de tentatives atteint'
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Réessayer
                            </>
                        )}
                    </Button>
                </div>

                {isMaxAttemptsReached && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Le nombre maximum de tentatives a été atteint.
                            Veuillez vérifier votre connexion internet et rafraîchir la page.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

// Network status detector
export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};

// Offline indicator component
export const OfflineIndicator: React.FC = () => {
    const isOnline = useNetworkStatus();

    if (isOnline) return null;

    return (
        <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <WifiOff className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">
                Mode hors ligne
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
                Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.
            </AlertDescription>
        </Alert>
    );
};

// Smart retry wrapper component
interface SmartRetryWrapperProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<RetryUIProps>;
    retryConfig?: Partial<RetryConfig>;
    onError?: (error: Error) => void;
}

export const SmartRetryWrapper: React.FC<SmartRetryWrapperProps> = ({
    children,
    fallback: FallbackComponent = RetryUI,
    retryConfig,
    onError,
}) => {
    const [error, setError] = useState<Error | null>(null);
    const { executeWithRetry, retryState, reset } = useRetryMechanism({
        config: retryConfig,
        onMaxAttemptsReached: onError,
    });

    const handleRetry = useCallback(() => {
        setError(null);
        reset();
    }, [reset]);

    if (error) {
        return (
            <FallbackComponent
                error={error}
                onRetry={handleRetry}
                isRetrying={retryState.isRetrying}
                attemptCount={retryState.attemptCount}
                maxAttempts={retryConfig?.maxAttempts || 3}
                nextRetryIn={retryState.nextRetryIn}
            />
        );
    }

    return <>{children}</>;
};


