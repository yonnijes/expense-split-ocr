export type TicketStatus = 'PENDING' | 'VALIDATING' | 'SPLITTING' | 'COMPLETED';

export interface Participant {
  id: string;
  name: string;
}

export interface SplitItem {
  description: string;
  price: number;
  participantIds: string[];
}

export function splitEquitativo(total: number, participants: Participant[]): number {
  if (participants.length === 0) throw new Error('No hay participantes');
  return total / participants.length;
}

export function splitPorItem(items: SplitItem[]): Record<string, number> {
  const debts: Record<string, number> = {};

  for (const item of items) {
    if (item.participantIds.length === 0) {
      throw new Error(`Item sin asignación: ${item.description}`);
    }

    const portion = item.price / item.participantIds.length;
    for (const pId of item.participantIds) {
      debts[pId] = (debts[pId] ?? 0) + portion;
    }
  }

  return debts;
}

export function validarCierre(total: number, debts: Record<string, number>, epsilon = 0.01): boolean {
  const sum = Object.values(debts).reduce((acc, n) => acc + n, 0);
  return Math.abs(sum - total) <= epsilon;
}
