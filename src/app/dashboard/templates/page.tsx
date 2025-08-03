'use client';

// Keep dynamic rendering (user-dependent content)
export const dynamic = 'force-dynamic';

import TemplatesClient from './TemplatesClient';

export default function TemplatesPage() {
  return <TemplatesClient />;
}