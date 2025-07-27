import ErrorPage from '@/components/ErrorPage';
import NotFoundIllustration from '@/components/illustrations/NotFoundIllustration';

export default function NotFound() {
  return (
    <ErrorPage
      errorCode="404"
      title="Page introuvable"
      description="Oups ! Il semble que cette page se soit perdue dans l'espace. Elle a peut-être été déplacée ou n'existe plus."
      illustration={<NotFoundIllustration />}
      showHomeButton={true}
      showBackButton={true}
    />
  );
}

export const metadata = {
  title: '404 - Page introuvable',
  description: 'La page que vous recherchez est introuvable.',
};