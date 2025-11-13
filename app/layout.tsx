/* eslint-disable react-refresh/only-export-components */
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Visual Effect - Interactive Effect Playground',
  description:
    'An interactive visualization tool for the Effect library that demonstrates how Effect operations execute over time with animated visual representations and synchronized sound effects.',
  metadataBase: new URL('https://effect.kitlangton.com'),
  openGraph: {
    title: 'Visual Effect - Interactive Effect Playground',
    description: "Interactive examples of TypeScript's beautiful Effect library",
    url: 'https://effect.kitlangton.com/',
    siteName: 'Visual Effect',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Visual Effect - Interactive Effect Playground',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visual Effect - Interactive Effect Playground',
    description: "Interactive examples of TypeScript's beautiful Effect library",
    images: ['/og-image.png'],
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
    google: 'google-verification-code', // Add your Google verification code if needed
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      {/* `vsc-initialized` is injected by some VS Code extensions after SSR; suppress hydration mismatch warnings */}
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
