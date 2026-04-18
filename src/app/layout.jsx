import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FarmCalc',
  description: 'Farm worker & expense management',
  manifest: '/manifest.json',
  themeColor: '#0d2818',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-512x512.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FarmCalc',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming on inputs for mobile native feel
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="max-w-md mx-auto min-h-screen bg-gray-950 flex flex-col relative overflow-x-hidden">
          {children}
        </div>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
