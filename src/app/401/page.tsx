import ErrorPage from '@/components/ErrorPage';
import UnauthorizedIllustration from '@/components/illustrations/UnauthorizedIllustration';

export default function UnauthorizedPage() {
  return (
    <ErrorPage
      errorCode="401"
      title="Authentification requise"
      description="Vous devez vous connecter pour accéder à cette ressource. Veuillez vous authentifier et réessayer."
      illustration={<UnauthorizedIllustration />}
      showHomeButton={true}
      showBackButton={false}
    />
  );
}

export const metadata = {
  title: '401 - Authentification requise',
  description: 'Vous devez vous connecter pour accéder à cette page.',
};