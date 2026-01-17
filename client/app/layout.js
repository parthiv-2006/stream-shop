'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ backgroundColor: '#0f0f1a' }}>
      <body className="antialiased" style={{ 
        backgroundColor: '#0f0f1a', 
        color: '#ffffff',
        minHeight: '100vh',
        background: 'linear-gradient(-45deg, #0f0f1a, #1a1a2e, #16213e, #0f0f1a)',
        backgroundSize: '400% 400%',
      }}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(26, 26, 46, 0.95)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />
        </QueryClientProvider>
      </body>
    </html>
  );
}
