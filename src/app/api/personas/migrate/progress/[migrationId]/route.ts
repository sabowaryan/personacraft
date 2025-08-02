import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';

// This would ideally be stored in Redis or a database in production
// For now, we'll import it from a shared module
import { getMigrationProgress, clearMigrationProgress } from '@/lib/services/migration-progress-service';

interface RouteParams {
    params: {
        migrationId: string;
    };
}

export async function GET(
    _request: NextRequest,
    { params }: RouteParams
) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { migrationId } = params;

        if (!migrationId) {
            return NextResponse.json(
                { error: 'Migration ID is required' },
                { status: 400 }
            );
        }

        const progress = getMigrationProgress(migrationId);

        if (!progress) {
            return NextResponse.json(
                { error: 'Migration not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            progress
        });

    } catch (error) {
        console.error('Get migration progress error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: RouteParams
) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { migrationId } = params;

        if (!migrationId) {
            return NextResponse.json(
                { error: 'Migration ID is required' },
                { status: 400 }
            );
        }

        const cleared = clearMigrationProgress(migrationId);

        if (!cleared) {
            return NextResponse.json(
                { error: 'Migration not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Migration progress cleared'
        });

    } catch (error) {
        console.error('Clear migration progress error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}