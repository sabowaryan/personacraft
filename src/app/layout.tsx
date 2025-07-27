import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import SuspenseWrapper from '@/components/SuspenseWrapper'
import StackProviderWrapper from '@/components/StackProviderWrapper'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PersonaCraft - AI-Powered Marketing Persona Generation',
  description: 'Créez des personas marketing détaillés et précis grâce à l\'intelligence artificielle. Générez des insights culturels avec Google Gemini et Qloo Taste AI.',
  keywords: 'personas marketing, intelligence artificielle, Gemini, Qloo, marketing digital, analyse d\'audience',
  authors: [{ name: 'PersonaCraft Team' }],
  creator: 'PersonaCraft',
  publisher: 'PersonaCraft',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'PersonaCraft - AI-Powered Marketing Persona Generation',
    description: 'Créez des personas marketing détaillés et précis grâce à l\'intelligence artificielle.',
    siteName: 'PersonaCraft',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PersonaCraft - AI-Powered Marketing Persona Generation',
    description: 'Créez des personas marketing détaillés et précis grâce à l\'intelligence artificielle.',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const customTheme = {
    light: {
      primary: '#7C3AED', // Purple-600
      primaryForeground: '#FFFFFF',
      secondary: '#F3F4F6', // Gray-100
      secondaryForeground: '#374151', // Gray-700
      background: '#FFFFFF',
      foreground: '#111827', // Gray-900
      card: '#FFFFFF',
      cardForeground: '#111827',
      border: '#E5E7EB', // Gray-200
      input: '#D1D5DB', // Gray-300
      ring: '#7C3AED', // Purple-600
      accent: '#3B82F6', // Blue-500
      accentForeground: '#FFFFFF',
    },
    dark: {
      primary: '#8B5CF6', // Purple-500
      primaryForeground: '#FFFFFF',
      secondary: '#374151', // Gray-700
      secondaryForeground: '#F9FAFB', // Gray-50
      background: '#111827', // Gray-900
      foreground: '#F9FAFB', // Gray-50
      card: '#1F2937', // Gray-800
      cardForeground: '#F9FAFB',
      border: '#374151', // Gray-700
      input: '#4B5563', // Gray-600
      ring: '#8B5CF6', // Purple-500
      accent: '#3B82F6', // Blue-500
      accentForeground: '#FFFFFF',
    },
    radius: '12px',
  };

  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable} scroll-smooth`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="57x57" href="/assets/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/assets/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/assets/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/assets/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/assets/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/assets/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/assets/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/assets/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-icon-180x180.png" />

        {/* Standard Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/assets/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />

        {/* Manifest and MS Tiles */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#7C3AED" />
        <meta name="msapplication-TileImage" content="/assets/ms-icon-144x144.png" />
        <meta name="theme-color" content="#7C3AED" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <StackProviderWrapper customTheme={customTheme}>
          <SuspenseWrapper>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </SuspenseWrapper>
        </StackProviderWrapper>
      </body>
    </html>
  )
}

