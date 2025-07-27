import MaintenanceIllustration from '@/components/illustrations/MaintenanceIllustration';
import RefreshButton from '@/components/RefreshButton';

export default function MaintenancePage() {
  return (
    <div className="relative min-h-screen">
      {/* Background extension to cover navbar area */}
      <div className="absolute top-0 left-0 right-0 min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 -z-10">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-gray-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1000ms' }}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2000ms' }}></div>
        <div className="absolute bottom-32 right-10 w-12 h-12 bg-gray-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '500ms' }}></div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
        <div className="max-w-lg w-full text-center z-10">
          {/* Maintenance Icon */}
          <div className="mb-8">
            <h1 className="text-6xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-gray-600 tracking-tight">
              503
            </h1>
          </div>

          {/* Illustration */}
          <div className="mb-8 flex justify-center">
            <div className="w-64 h-64 sm:w-80 sm:h-80">
              <MaintenanceIllustration />
            </div>
          </div>

          {/* Title and Description */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Maintenance en cours
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              Nous effectuons actuellement une maintenance programmée pour améliorer nos services.
              Nous serons de retour très bientôt !
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Durée estimée :</strong> 30 minutes<br />
                <strong>Début :</strong> {new Date().toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <RefreshButton />
          </div>

          {/* Contact info */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              Pour toute urgence, contactez-nous à{' '}
              <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-800">
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: '503 - Maintenance en cours',
  description: 'Site en maintenance, nous serons de retour bientôt.',
};