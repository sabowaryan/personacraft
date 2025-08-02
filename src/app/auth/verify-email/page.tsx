import ClientDynamicWrapper from '@/components/ClientDynamicWrapper';

// Force dynamic rendering to avoid SSG issues with Stack Auth
export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  return <ClientDynamicWrapper importPath="verify-email" />;
}
