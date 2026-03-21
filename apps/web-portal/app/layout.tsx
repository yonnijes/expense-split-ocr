import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ExpenseSplit OCR',
  description: 'Portal web de OCR + split de gastos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
