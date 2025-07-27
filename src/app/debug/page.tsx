import LocalStorageDebug from '@/components/debug/LocalStorageDebug';

export default function DebugPage() {
    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="container-main">
                <LocalStorageDebug />
            </div>
        </div>
    );
}