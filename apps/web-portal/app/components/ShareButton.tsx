'use client';

import { Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatWhatsAppMessage, buildWhatsAppUrl } from '@domain/whatsapp-formatter';

type Props = {
  merchant: string;
  total: number;
  currency: string;
  participants: Array<{ name: string; amount: number }>;
  sessionId?: string;
};

export function ShareButton({ merchant, total, currency, participants, sessionId }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const shareUrl = sessionId ? `${baseUrl}/t/${sessionId}` : undefined;

  const message = formatWhatsAppMessage({ merchant, total, currency, participants, shareUrl });
  const waUrl = buildWhatsAppUrl(message);

  async function handleCopy() {
    const text = buildCopyText({ merchant, total, currency, participants, shareUrl });
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a href={waUrl} target="_blank" rel="noopener noreferrer">
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Share2 className="mr-2 h-4 w-4" />
          WhatsApp
        </Button>
      </a>

      <Button variant="outline" onClick={handleCopy}>
        <Copy className="mr-2 h-4 w-4" />
        Copiar resumen
      </Button>
    </div>
  );
}

function buildCopyText(data: { merchant: string; total: number; currency: string; participants: Array<{ name: string; amount: number }>; shareUrl?: string }): string {
  const lines: string[] = [];
  lines.push(`🧾 Resumen de Gasto: ${data.merchant}`);
  lines.push(`💰 Total: ${data.total.toFixed(2)}${data.currency}`);
  lines.push('');
  lines.push('👥 Reparto:');
  for (const p of data.participants) {
    lines.push(`• ${p.name}: ${p.amount.toFixed(2)}${data.currency}`);
  }
  if (data.shareUrl) {
    lines.push('');
    lines.push(`🔗 Detalle: ${data.shareUrl}`);
  }
  lines.push('');
  lines.push('Generado con ExpenseSplit (MVP)');
  return lines.join('\n');
}
