'use client';

import { useEffect } from 'react';
import { ReceiptText } from 'lucide-react';
import { TicketUploader } from './components/TicketUploader';
import { ProcessingSkeleton } from './components/ProcessingSkeleton';
import { TicketEditor } from './components/TicketEditor';
import { SplitManager } from './components/SplitManager';
import { requestOcr } from './hooks/useOcrTicket';
import { useTicketStore } from './stores/useTicketStore';
import { Button } from '@/components/ui/button';

const progressSteps = ['Leyendo comercio...', 'Analizando precios...', 'Validando estructura...'];

export default function Page() {
  const { data, actions } = useTicketStore();

  useEffect(() => {
    if (data.step !== 'processing') return;
    let i = 0;
    const t = setInterval(() => {
      actions.setProgressMessage(progressSteps[i % progressSteps.length]);
      i += 1;
    }, 1300);
    return () => clearInterval(t);
  }, [data.step, actions]);

  async function runOcr(file: File) {
    actions.selectImage(file);
    actions.setStep('processing');
    actions.setError(null);

    try {
      const ticket = await requestOcr(file);
      actions.setTicket(ticket);
    } catch (e: any) {
      actions.setError(e?.message ?? 'No se pudo leer el ticket');
      actions.setStep('upload');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">ExpenseSplit OCR</span>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Sesión anónima</span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        {data.error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{data.error}</div>
        )}

        {data.step === 'upload' && <TicketUploader onSubmit={runOcr} />}

        {data.step === 'processing' && <ProcessingSkeleton message={data.progressMessage} />}

        {data.step === 'editing' && data.ticket && data.imagePreviewUrl && (
          <TicketEditor
            imageUrl={data.imagePreviewUrl}
            value={data.ticket}
            onChange={actions.updateTicket}
            onContinue={() => actions.setStep('splitting')}
          />
        )}

        {data.step === 'splitting' && data.ticket && (
          <SplitManager
            ticket={data.ticket}
            participants={data.participants}
            splitMode={data.splitMode}
            allocations={data.allocations}
            onAddParticipant={actions.addParticipant}
            onRemoveParticipant={actions.removeParticipant}
            onSetMode={actions.setSplitMode}
            onAssignItem={actions.assignItemToParticipant}
          />
        )}

        {(data.step === 'editing' || data.step === 'splitting') && (
          <Button variant="outline" onClick={actions.clearFlow}>
            Reiniciar flujo
          </Button>
        )}
      </section>
    </main>
  );
}
