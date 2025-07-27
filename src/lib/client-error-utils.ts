export interface ApiError {
  error: string;
  status?: number;
}

export class AuthTimeoutError extends Error {
  constructor(message: string = 'Authentication timeout') {
    super(message);
    this.name = 'AuthTimeoutError';
  }
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ 
      error: 'Unknown error occurred' 
    }));
    
    // Handle specific error types
    if (response.status === 408) {
      throw new AuthTimeoutError(errorData.error);
    }
    
    if (response.status === 401) {
      // Redirect to login or show auth error
      window.location.href = '/auth/signin';
      throw new Error('Authentication required');
    }
    
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export function isAuthTimeoutError(error: unknown): error is AuthTimeoutError {
  return error instanceof AuthTimeoutError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AuthTimeoutError) {
    return 'La connexion a pris trop de temps. Veuillez réessayer.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Une erreur inattendue s\'est produite';
}