import './globals.css';
import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/providers/theme-provider';

export const metadata: Metadata = {
  title: {
    default: 'PersonaCraft - Générateur de Personas IA',
    template: '%s | PersonaCraft'
  },
  description: 'Créez des personas marketing authentiques et détaillés avec notre IA avancée. Génération instantanée, métriques de qualité et export professionnel.',
  keywords: ['personas marketing', 'génération IA', 'audience cible', 'marketing digital', 'intelligence artificielle', 'personas utilisateur'],
  authors: [{ name: 'PersonaCraft Team' }],
  creator: 'PersonaCraft',
  openGraph: {
    title: 'PersonaCraft - Générateur de Personas IA',
    description: 'Créez des personas marketing authentiques et détaillés avec notre IA avancée',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://personacraft.app',
    siteName: 'PersonaCraft'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PersonaCraft - Générateur de Personas IA',
    description: 'Créez des personas marketing authentiques et détaillés avec notre IA avancée'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}