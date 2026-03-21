'use client';

import { create } from 'zustand';
import { TicketSchema, type TicketContract } from '@shared/contracts';

export type FlowStep = 'upload' | 'processing' | 'editing' | 'splitting';
export type SplitMode = 'equal' | 'by-item';

export type Participant = {
  id: string;
  name: string;
};

type TicketData = TicketContract;

type TicketState = {
  step: FlowStep;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  progressMessage: string;
  ticket: TicketData | null;
  splitMode: SplitMode;
  participants: Participant[];
  allocations: Record<number, string[]>;
  error: string | null;
};

type TicketActions = {
  selectImage: (file: File) => void;
  setStep: (step: FlowStep) => void;
  setProgressMessage: (message: string) => void;
  setTicket: (ticket: TicketData) => void;
  updateTicket: (ticket: TicketData) => void;
  setError: (message: string | null) => void;
  clearFlow: () => void;
  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
  setSplitMode: (mode: SplitMode) => void;
  assignItemToParticipant: (itemIndex: number, participantIds: string[]) => void;
};

type TicketStore = {
  data: TicketState;
  actions: TicketActions;
};

const initialState: TicketState = {
  step: 'upload',
  imageFile: null,
  imagePreviewUrl: null,
  progressMessage: 'Preparando OCR...',
  ticket: null,
  splitMode: 'equal',
  participants: [],
  allocations: {},
  error: null,
};

export const useTicketStore = create<TicketStore>((set, get) => ({
  data: initialState,
  actions: {
    selectImage: (file) => {
      const previewUrl = URL.createObjectURL(file);
      set((state) => ({
        data: {
          ...state.data,
          imageFile: file,
          imagePreviewUrl: previewUrl,
          error: null,
          step: 'upload',
        },
      }));
    },

    setStep: (step) => set((state) => ({ data: { ...state.data, step } })),

    setProgressMessage: (message) =>
      set((state) => ({ data: { ...state.data, progressMessage: message } })),

    setTicket: (ticket) =>
      set((state) => ({
        data: {
          ...state.data,
          ticket: TicketSchema.parse(ticket),
          step: 'editing',
          error: null,
        },
      })),

    updateTicket: (ticket) =>
      set((state) => ({ data: { ...state.data, ticket: TicketSchema.parse(ticket) } })),

    setError: (message) => set((state) => ({ data: { ...state.data, error: message } })),

    clearFlow: () => {
      const current = get().data;
      if (current.imagePreviewUrl) URL.revokeObjectURL(current.imagePreviewUrl);
      set({ data: { ...initialState } });
    },

    addParticipant: (name) =>
      set((state) => {
        const clean = name.trim();
        if (!clean) return state;
        return {
          data: {
            ...state.data,
            participants: [...state.data.participants, { id: crypto.randomUUID(), name: clean }],
          },
        };
      }),

    removeParticipant: (id) =>
      set((state) => ({
        data: {
          ...state.data,
          participants: state.data.participants.filter((p) => p.id !== id),
          allocations: Object.fromEntries(
            Object.entries(state.data.allocations).map(([k, v]) => [k, v.filter((pid) => pid !== id)])
          ),
        },
      })),

    setSplitMode: (mode) => set((state) => ({ data: { ...state.data, splitMode: mode } })),

    assignItemToParticipant: (itemIndex, participantIds) =>
      set((state) => ({
        data: {
          ...state.data,
          allocations: {
            ...state.data.allocations,
            [itemIndex]: participantIds,
          },
        },
      })),
  },
}));

export function computeItemsSum(ticket: TicketContract | null) {
  if (!ticket) return 0;
  return ticket.items.reduce((acc, item) => acc + item.price * (item.quantity ?? 1), 0);
}

export function computeSplitSummary(data: TicketState): Record<string, number> {
  const { ticket, participants, splitMode, allocations } = data;
  if (!ticket || participants.length === 0) return {};

  const out: Record<string, number> = Object.fromEntries(participants.map((p) => [p.id, 0]));

  if (splitMode === 'equal') {
    const each = Number((ticket.total / participants.length).toFixed(2));
    participants.forEach((p) => {
      out[p.id] = each;
    });
    return out;
  }

  ticket.items.forEach((item, idx) => {
    const owners = allocations[idx] ?? [];
    if (!owners.length) return;
    const totalItem = item.price * (item.quantity ?? 1);
    const each = totalItem / owners.length;
    owners.forEach((id) => {
      out[id] = Number((out[id] + each).toFixed(2));
    });
  });

  return out;
}
