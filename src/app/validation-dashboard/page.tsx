/**
 * Validation Dashboard - Main monitoring interface
 * Displays validation metrics, success rates, and performance graphs
 */

import { ValidationDashboard } from '@/components/validation/dashboard/ValidationDashboard';

export default function ValidationDashboardPage() {
    return (
        <div className="container mx-auto p-6">
            <ValidationDashboard />
        </div>
    );
}