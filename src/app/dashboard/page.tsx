import DashboardClient from './DashboardClient';

// Keep dynamic rendering (user-dependent content)
export const dynamic = 'force-dynamic';

export default function Dashboard() {
  return <DashboardClient />;
}