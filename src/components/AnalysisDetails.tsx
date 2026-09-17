import React from 'react';
import { AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Target, Shield, CheckCircle, AlertTriangle, Info, Zap, Flame, Compass, Scale } from 'lucide-react';

interface AnalysisDetailsProps {
  analysis: AnalysisResult;
}

export const AnalysisDetails: React.FC<AnalysisDetailsProps> = ({ analysis }) => {
  const isCall = analysis.direction === 'CALL';

  return (
    <div className="space-y-4 text-slate-200">
      {/* Primary KPI Card */}
      <div className={`p-5 rounded-xl border ${
        isCall
          ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30'
          : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/30'
      } shadow-xl`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-slate-400 font-semibold block mb-1">
              PREVISÃO DE PRÓXIMA VELA [1M]
            </span>
            <div className="flex items-center gap-3">
              <span
                className={`text-3xl font-extrabold flex items-center gap-2 ${
                  isCall ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isCall ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                {analysis.direction}
              </span>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 font-mono font-bold text-slate-300">
                AÇÃO: {analysis.tradeAction}
              </span>
              {analysis.modelUsed && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60 font-mono text-indigo-300">
                  {analysis.modelUsed}
                </span>
              )}
            </div>
          </div>

          {/* Probability Gauge */}
          <div className="flex items-center gap-4 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Probabilidade</span>
              <span className={`text-2xl font-black font-mono ${isCall ? 'text-emerald-400' : 'text-rose-400'}`}>
                {analysis.probability}%
              </span>
            </div>
            <div className="h-10 w-1 rounded-full bg-slate-800" />
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Risco / Retorno</span>
              <span className="text-lg font-bold font-mono text-indigo-300">{analysis.riskRewardRatio || '1:2.5'}</span>
            </div>
          </div>
        </div>

        {/* Progress meter bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>Força da Convicção: {analysis.confidence || 'Alta'}</span>
            <span>{analysis.probability}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCall ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(10, analysis.probability))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Text Summary & Market Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resumo Textual */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" /> Resumo do Price Action
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{analysis.textSummary}</p>
        </div>

        {/* Estrutura de Mercado */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-indigo-400" /> Estrutura & Tendência
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Tendência Geral:</span>
              <span className="font-semibold text-slate-200">{analysis.trend}</span>
            </div>
            <div className="text-xs text-slate-300">
              <span className="text-slate-400 block mb-0.5">Leitura Estrutural:</span>
              <span className="font-mono text-[11px] bg-slate-950 p-2 rounded block border border-slate-800 text-slate-200">
                {analysis.marketStructure}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Momentum 3-5 velas */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Momentum das Últimas 3-5 Velas
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          {analysis.momentumAnalysis}
        </p>
      </div>

      {/* Padrões de Candlestick Identificados */}
      {analysis.identifiedPatterns && analysis.identifiedPatterns.length > 0 && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400" /> Padrões de Candlestick Detectados
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {analysis.identifiedPatterns.map((pattern, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-200">{pattern.name}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      pattern.sentiment === 'bullish'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : pattern.sentiment === 'bearish'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {pattern.sentiment.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{pattern.description}</p>
                {pattern.location && (
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">Posição: {pattern.location}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regras do Prompt Mestre Verificadas */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-indigo-400" /> Validação das Regras do Sistema Mestre
        </h4>
        <div className="space-y-2">
          {analysis.rulesChecked?.map((rc, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-2 bg-slate-950/70 rounded border border-slate-800/60 text-xs">
              {rc.status === 'pass' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : rc.status === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold text-slate-200 mr-2">{rc.rule}:</span>
                <span className="text-slate-400">{rc.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
