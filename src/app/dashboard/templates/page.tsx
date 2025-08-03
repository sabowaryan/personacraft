// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

import TemplatesClient from './TemplatesClient';

export default function TemplatesPage() {
  return <TemplatesClient />;
}