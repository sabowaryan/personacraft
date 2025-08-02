import ClientDynamicWrapper from '@/components/ClientDynamicWrapper';

// Force dynamic rendering to avoid SSG issues with Stack Auth
export const dynamic = 'force-dynamic';

export default function CustomSignInPage() {
  return <ClientDynamicWrapper importPath="signin" />;
}

