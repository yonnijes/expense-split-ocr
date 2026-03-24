/**
 * Domain Service for formatting expense summary messages.
 * Separated from the UI to comply with SOLID (Single Responsibility).
 * Supports both WhatsApp (Markdown) and plain text (Clipboard).
 */

export interface ExpenseSummaryData {
  merchant: string;
  total: number;
  currency: string;
  participants: Array<{ name: string; amount: number }>;
  shareUrl?: string;
}

export interface FormatOptions {
  useMarkdown?: boolean;
}

/**
 * Formats a generic expense summary message.
 */
export function formatExpenseSummary(data: ExpenseSummaryData, options: FormatOptions = {}): string {
  const { useMarkdown = false } = options;
  const lines: string[] = [];

  const bold = (text: string) => (useMarkdown ? `*${text}*` : text);
  const italic = (text: string) => (useMarkdown ? `_${text}_` : text);

  lines.push(`🧾 ${bold(`Resumen de Gasto: ${data.merchant}`)}`);
  lines.push(`💰 ${bold('Total:')} ${data.total.toFixed(2)}${data.currency}`);
  lines.push('');
  lines.push(`👥 ${bold('Reparto:')}`);

  for (const p of data.participants) {
    lines.push(`• ${bold(`${p.name}:`)} ${p.amount.toFixed(2)}${data.currency}`);
  }

  if (data.shareUrl) {
    lines.push('');
    lines.push(`🔗 ${bold('Detalle:')} ${data.shareUrl}`);
  }

  lines.push('');
  const signature = 'Generado con ExpenseSplit (MVP)';
  lines.push(italic(signature));

  return lines.join('\n');
}

/**
 * Specifically formats a message for WhatsApp using Markdown.
 */
export function formatWhatsAppMessage(data: ExpenseSummaryData): string {
  return formatExpenseSummary(data, { useMarkdown: true });
}

/**
 * Specifically formats a message for plain text copying.
 */
export function formatCopyText(data: ExpenseSummaryData): string {
  return formatExpenseSummary(data, { useMarkdown: false });
}

export function buildWhatsAppUrlFromMessage(message: string): string {
  const base = 'https://wa.me/?text=';
  return base + encodeURIComponent(message);
}

export function createWhatsAppShareLink(data: ExpenseSummaryData): string {
  const message = formatWhatsAppMessage(data);
  return buildWhatsAppUrlFromMessage(message);
}

