import ClientDynamicWrapper from '@/components/ClientDynamicWrapper';

// Can now be static since we're using dev auth

export default function CustomSignInPage() {
  return <ClientDynamicWrapper importPath="signin" />;
}

