import React from 'react';
import { Activity, BookOpen, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenPromptModal: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPromptModal, isAnalyzing }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                Candlestick Vision 1M
              </h1>
              <span className="hidden sm:inline-block font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                Live Overlay 1M
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Trader Algorítmico Sênior • Visão Computacional & Price Action
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenPromptModal}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 active:scale-95 text-slate-200 text-xs font-semibold rounded-lg border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>O Prompt Mestre</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-indigo-950 text-indigo-300 rounded border border-indigo-800/50">
              Parte 1
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
