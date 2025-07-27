export default function Loading() {
  // Stack uses React Suspense, which will render this page while user data is being fetched.
  // See: https://nextjs.org/docs/app/api-reference/file-conventions/loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
        <p className="text-gray-600 font-medium">Chargement...</p>
      </div>
    </div>
  );
}
