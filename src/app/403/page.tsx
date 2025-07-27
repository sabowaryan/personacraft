import ErrorPage from '@/components/ErrorPage';
import ForbiddenIllustration from '@/components/illustrations/ForbiddenIllustration';

export default function ForbiddenPage() {
  return (
    <ErrorPage
      errorCode="403"
      title="Accès interdit"
      description="Vous n'avez pas les permissions nécessaires pour accéder à cette ressource. Veuillez contacter l'administrateur si vous pensez qu'il s'agit d'une erreur."
      illustration={<ForbiddenIllustration />}
      showHomeButton={true}
      showBackButton={true}
    />
  );
}

export const metadata = {
  title: '403 - Accès interdit',
  description: 'Vous n\'avez pas les permissions pour accéder à cette page.',
};