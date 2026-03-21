'use client';

import { useRef, useState } from 'react';
import { Upload, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  onSubmit: (file: File) => Promise<void>;
};

export function TicketUploader({ onSubmit }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleFile(file?: File) {
    if (!file) return;
    setIsBusy(true);
    try {
      await onSubmit(file);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">Sube tu ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50/40">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Upload className="h-6 w-6" />
          </div>
          <p className="mb-1 text-sm text-slate-900">Arrastra una imagen JPG/PNG o selecciónala</p>
          <p className="mb-6 text-xs text-slate-500">Tip: en móvil puedes abrir la cámara directamente</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              className="bg-slate-900 hover:bg-slate-800"
              disabled={isBusy}
              onClick={() => inputRef.current?.click()}
            >
              {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Elegir imagen
            </Button>

            <Button
              variant="outline"
              disabled={isBusy}
              onClick={() => inputRef.current?.click()}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Camera className="mr-2 h-4 w-4" />
              Usar cámara
            </Button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </CardContent>
    </Card>
  );
}
