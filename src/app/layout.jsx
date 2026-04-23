import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { BottomNav } from '@/components/ui/BottomNav';
import { GlobalAutoPDFDownloader } from '@/components/GlobalAutoPDFDownloader';
import { HydrationWrapper } from '@/components/HydrationWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FarmCalc',
  description: 'Farm worker & expense management',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col relative overflow-x-hidden shadow-2xl shadow-gray-200/50 ">
          <HydrationWrapper>
            {children}
            <BottomNav />
            <GlobalAutoPDFDownloader />
          </HydrationWrapper>
        </div>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
