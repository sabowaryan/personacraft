// Polyfills pour l'environnement serveur Next.js
if (typeof globalThis !== 'undefined') {
  // Polyfill pour 'self' dans l'environnement serveur
  if (typeof globalThis.self === 'undefined') {
    (globalThis as any).self = globalThis;
  }
  
  // Polyfill pour 'window' si nécessaire
  if (typeof globalThis.window === 'undefined') {
    (globalThis as any).window = globalThis;
  }
}