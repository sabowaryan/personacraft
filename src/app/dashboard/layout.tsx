// Keep dynamic rendering for dashboard pages (user-dependent content)
export const dynamic = 'force-dynamic';

import DashboardLayoutClient from './DashboardLayoutClient';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}