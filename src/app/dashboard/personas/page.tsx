import PersonasClient from './PersonasClient';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function PersonasPage() {
  return <PersonasClient />;
}