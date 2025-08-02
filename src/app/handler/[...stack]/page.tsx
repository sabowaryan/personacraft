// Temporairement désactivé pour éviter les erreurs de compilation
// import { StackHandler } from "@stackframe/stack";
// import { getStackServerApp } from "@/stack-server";

export default async function Handler(props: unknown) {
  // Temporairement désactivé - Stack Auth
  // const stackServerApp = await getStackServerApp();
  // return <StackHandler fullPage app={stackServerApp} routeProps={props} />;

  // Composant de remplacement temporaire
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentification temporairement désactivée
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Cette page sera disponible une fois l'authentification réactivée.
          </p>
          <div className="mt-4">
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Aller au Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}