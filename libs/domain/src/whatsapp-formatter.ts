/**
 * Domain Service para formatear mensajes de WhatsApp.
 * Separado de la UI para cumplir SOLID (Single Responsibility).
 * Permite agregar otros canales (SMS, Telegram) sin tocar el frontend.
 */

export interface WhatsAppMessageData {
  merchant: string;
  total: number;
  currency: string;
  participants: Array<{ name: string; amount: number }>;
  shareUrl?: string;
}

export function formatWhatsAppMessage(data: WhatsAppMessageData): string {
  const lines: string[] = [];

  lines.push(`🧾 *Resumen de Gasto: ${data.merchant}*`);
  lines.push(`💰 *Total:* ${data.total.toFixed(2)}${data.currency}`);
  lines.push('');
  lines.push('👥 *Reparto:*');

  for (const p of data.participants) {
    lines.push(`• *${p.name}:* ${p.amount.toFixed(2)}${data.currency}`);
  }

  if (data.shareUrl) {
    lines.push('');
    lines.push(`🔗 *Detalle:* ${data.shareUrl}`);
  }

  lines.push('');
  lines.push('_Generado con ExpenseSplit (MVP)_');

  return lines.join('\n');
}

export function buildWhatsAppUrl(message: string): string {
  const base = 'https://wa.me/?text=';
  return base + encodeURIComponent(message);
}

export function createWhatsAppShareLink(data: WhatsAppMessageData): string {
  const message = formatWhatsAppMessage(data);
  return buildWhatsAppUrl(message);
}
