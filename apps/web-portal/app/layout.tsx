import './globals.css';
import type { Metadata } from 'next';
import logger from '../lib/logger';

export const metadata: Metadata = {
  title: 'ExpenseSplit OCR',
  description: 'Portal web de OCR + split de gastos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  logger.info('Rendering RootLayout on server');
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
