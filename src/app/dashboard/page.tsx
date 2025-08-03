import DashboardClient from './DashboardClient';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function Dashboard() {
  return <DashboardClient />;
}