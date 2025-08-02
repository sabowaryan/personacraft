import nextDynamic from 'next/dynamic';

// Force dynamic rendering to avoid SSG issues with Stack Auth
export const dynamic = 'force-dynamic';

// Dynamically import the content component with no SSR
const VerifyEmailContent = nextDynamic(() => import('./VerifyEmailContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  )
});

export default function VerifyEmailPage() {
  return <VerifyEmailContent />;
}
