'use client';

import PersonasClient from './PersonasClient';

// Keep dynamic rendering (user-dependent content)
export const dynamic = 'force-dynamic';

export default function PersonasPage() {
  return <PersonasClient />;
}