import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Sparkles, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { SAMPLE_CHARTS } from '../data/sampleCharts';
import { SampleChart } from '../types';

interface ChartUploaderProps {
  onImageSelected: (base64: string, name?: string, sample?: SampleChart) => void;
  selectedSampleId?: string;
  isAnalyzing?: boolean;
}

export const ChartUploader: React.FC<ChartUploaderProps> = ({
  onImageSelected,
  selectedSampleId,
  isAnalyzing = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [pasteNotice, setPasteNotice] = useState(false);

  // Global paste listener (Ctrl+V screenshot anywhere)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            setPasteNotice(true);
            setTimeout(() => setPasteNotice(false), 3000);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onImageSelected(base64, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-950/30 shadow-lg shadow-indigo-950'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-3 bg-slate-800/80 rounded-full text-indigo-400 border border-slate-700">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">
              Clique para selecionar ou arraste o print do gráfico (1m)
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Dica: Você também pode colar diretamente com <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-300">Ctrl + V</kbd>
            </span>
          </div>
        </div>

        {pasteNotice && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" /> Print colado da área de transferência!
          </div>
        )}
      </div>

      {/* Preset 1m Charts Library */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Ou teste com cenários reais de 1M:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_CHARTS.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            const isCall = sample.direction === 'CALL';

            return (
              <button
                key={sample.id}
                onClick={() => onImageSelected(sample.imageUrl, sample.title, sample)}
                disabled={isAnalyzing}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-950'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-slate-300 truncate pr-2">
                    {sample.title}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                      isCall
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                    }`}
                  >
                    {sample.direction} {sample.probability}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {sample.patternName}
                </p>
                {isSelected && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-indigo-400 font-semibold">
                    <span>Ativo Selecionado</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
