import React, { useRef, useState, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { Eye, EyeOff, Download, Sliders, Layers, Sparkles, TrendingUp, TrendingDown, Target, ShieldAlert, Maximize2 } from 'lucide-react';

interface ChartOverlayViewerProps {
  imageSrc: string;
  analysis: AnalysisResult | null;
  isLoading?: boolean;
}

export const ChartOverlayViewer: React.FC<ChartOverlayViewerProps> = ({
  imageSrc,
  analysis,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Overlay layer controls
  const [showEntryZone, setShowEntryZone] = useState(true);
  const [showTargetStop, setShowTargetStop] = useState(true);
  const [showLevels, setShowLevels] = useState(true);
  const [showProjectedCandle, setShowProjectedCandle] = useState(true);
  const [opacity, setOpacity] = useState(0.4);
  const [isExporting, setIsExporting] = useState(false);

  // Download combined image directly to user's device
  const handleDownloadAnnotatedImage = async () => {
    if (!imgRef.current || !analysis) return;
    setIsExporting(true);

    try {
      const img = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 450;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw base image
      ctx.drawImage(img, 0, 0, w, h);

      const isCall = analysis.direction === 'CALL';
      const mainColor = isCall ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
      const mainColorRgba = isCall ? `rgba(34, 197, 94, ${opacity})` : `rgba(239, 68, 68, ${opacity})`;

      // 2. Draw Entry Zone / Order Block
      if (showEntryZone && analysis.entryZone) {
        const ez = analysis.entryZone;
        const bx = (ez.xRatio - ez.widthRatio / 2) * w;
        const by = (ez.yRatio - ez.heightRatio / 2) * h;
        const bw = ez.widthRatio * w;
        const bh = ez.heightRatio * h;

        ctx.fillStyle = mainColorRgba;
        ctx.fillRect(bx, by, bw, bh);

        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText(`ENTRADA ${analysis.direction}`, bx + 4, Math.max(16, by - 6));
      }

      // 3. Draw Target Line
      if (showTargetStop && analysis.keyLevels) {
        const targetY = analysis.keyLevels.targetYRatio * h;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, targetY);
        ctx.lineTo(w, targetY);
        ctx.stroke();

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillText(`ALVO (TP) [${analysis.direction}] ${analysis.probability}%`, 15, Math.max(20, targetY - 8));

        // Draw Stop Loss Line
        const stopY = analysis.keyLevels.stopLossYRatio * h;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, stopY);
        ctx.lineTo(w, stopY);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillText('STOP LOSS', 15, Math.min(h - 8, stopY + 18));
      }

      // 4. Draw Support & Resistance
      if (showLevels && analysis.keyLevels) {
        analysis.keyLevels.supports?.forEach((sup) => {
          const sy = sup.yRatio * h;
          ctx.strokeStyle = '#3b82f6';
          ctx.setLineDash([6, 4]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, sy);
          ctx.lineTo(w, sy);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#93c5fd';
          ctx.font = '11px "JetBrains Mono", monospace';
          ctx.fillText(sup.label, w - 210, sy - 5);
        });

        analysis.keyLevels.resistances?.forEach((res) => {
          const ry = res.yRatio * h;
          ctx.strokeStyle = '#f97316';
          ctx.setLineDash([6, 4]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, ry);
          ctx.lineTo(w, ry);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#fdba74';
          ctx.font = '11px "JetBrains Mono", monospace';
          ctx.fillText(res.label, w - 210, ry - 5);
        });
      }

      // 5. Draw Projected Next Candle
      if (showProjectedCandle && analysis.nextCandleProjection) {
        const pc = analysis.nextCandleProjection;
        const cx = pc.xRatio * w;
        const openY = pc.openYRatio * h;
        const closeY = pc.closeYRatio * h;
        const highY = pc.highYRatio * h;
        const lowY = pc.lowYRatio * h;
        const cw = Math.max(10, w * 0.025);
        const candleColor = pc.direction === 'bullish' ? '#22c55e' : '#ef4444';

        // Wick
        ctx.strokeStyle = candleColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, highY);
        ctx.lineTo(cx, lowY);
        ctx.stroke();

        // Body
        ctx.fillStyle = candleColor;
        const topY = Math.min(openY, closeY);
        const bodyH = Math.max(4, Math.abs(closeY - openY));
        ctx.fillRect(cx - cw / 2, topY, cw, bodyH);

        // Projection Badge
        ctx.fillStyle = candleColor;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('PRÓXIMA VELA', cx - cw - 40, topY + bodyH / 2 + 4);
      }

      // Watermark
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(10, h - 32, 340, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(`AI VISION 1M • ${analysis.direction} (${analysis.probability}%)`, 18, h - 16);

      // Trigger download
      const link = document.createElement('a');
      link.download = `analise_preditiva_1m_${analysis.direction.toLowerCase()}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Falha ao exportar imagem:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const isCall = analysis?.direction === 'CALL';

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs text-slate-400 font-semibold tracking-wide uppercase">
            Visão Computacional 1M
          </span>
          {analysis && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isCall
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isCall ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {analysis.direction} ({analysis.probability}%)
            </span>
          )}
        </div>

        {/* Layer Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/60 text-xs">
            <button
              onClick={() => setShowEntryZone(!showEntryZone)}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                showEntryZone ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Alternar Zona de Entrada / Order Block"
            >
              Entrada
            </button>
            <button
              onClick={() => setShowTargetStop(!showTargetStop)}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                showTargetStop ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Alternar Linhas de Alvo e Stop Loss"
            >
              Alvo / Stop
            </button>
            <button
              onClick={() => setShowLevels(!showLevels)}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                showLevels ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Alternar Suportes e Resistências"
            >
              Níveis
            </button>
            <button
              onClick={() => setShowProjectedCandle(!showProjectedCandle)}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                showProjectedCandle ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Alternar Projeção da Próxima Vela"
            >
              Próx. Vela
            </button>
          </div>

          {/* Opacity Slider */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              title="Opacidade do Overlay"
            />
            <span className="font-mono text-[10px] w-6">{Math.round(opacity * 100)}%</span>
          </div>

          {/* Direct Download Button */}
          {analysis && (
            <button
              onClick={handleDownloadAnnotatedImage}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-emerald-950"
              title="Baixar a imagem diretamente editada pela IA (sem precisar rodar Python)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Renderizando...' : 'Baixar Imagem Editada'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main View Area with Absolute Overlays */}
      <div ref={containerRef} className="relative w-full overflow-hidden bg-slate-950 flex items-center justify-center min-h-[380px] select-none">
        {/* The Base Chart Image */}
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Gráfico Candlestick 1m"
          className="w-full h-auto max-h-[600px] object-contain block mx-auto pointer-events-none"
        />

        {/* Loading Skeleton / Scanner */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center z-30">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <Sparkles className="w-6 h-6 text-indigo-400 absolute animate-pulse" />
            </div>
            <p className="mt-4 font-mono text-sm text-indigo-300 font-medium tracking-wide">
              Examinando estrutura de velas e liquidez 1M...
            </p>
            {/* Visual scan line */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse top-1/2 -translate-y-1/2 shadow-lg shadow-cyan-500/50" />
          </div>
        )}

        {/* SVG Mathematical Overlay Layer */}
        {analysis && !isLoading && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
          >
            {/* 1. Target (Take Profit) Horizontal Line */}
            {showTargetStop && analysis.keyLevels?.targetYRatio !== undefined && (
              <g>
                <line
                  x1="0"
                  y1={analysis.keyLevels.targetYRatio * 600}
                  x2="1000"
                  y2={analysis.keyLevels.targetYRatio * 600}
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
                <rect
                  x="12"
                  y={analysis.keyLevels.targetYRatio * 600 - 24}
                  width="180"
                  height="22"
                  fill="#0f172a"
                  stroke="#22c55e"
                  strokeWidth="1.5"
                  rx="4"
                />
                <text
                  x="18"
                  y={analysis.keyLevels.targetYRatio * 600 - 9}
                  fill="#22c55e"
                  fontFamily="monospace"
                  fontSize="12"
                  fontWeight="bold"
                >
                  ALVO (TP) • {analysis.direction} {analysis.probability}%
                </text>
              </g>
            )}

            {/* 2. Stop Loss Horizontal Line */}
            {showTargetStop && analysis.keyLevels?.stopLossYRatio !== undefined && (
              <g>
                <line
                  x1="0"
                  y1={analysis.keyLevels.stopLossYRatio * 600}
                  x2="1000"
                  y2={analysis.keyLevels.stopLossYRatio * 600}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />
                <rect
                  x="12"
                  y={analysis.keyLevels.stopLossYRatio * 600 + 4}
                  width="120"
                  height="22"
                  fill="#0f172a"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  rx="4"
                />
                <text
                  x="18"
                  y={analysis.keyLevels.stopLossYRatio * 600 + 19}
                  fill="#ef4444"
                  fontFamily="monospace"
                  fontSize="12"
                  fontWeight="bold"
                >
                  STOP LOSS
                </text>
              </g>
            )}

            {/* 3. Support & Resistance Key Levels */}
            {showLevels && (
              <>
                {analysis.keyLevels?.supports?.map((sup, idx) => (
                  <g key={`sup-${idx}`}>
                    <line
                      x1="0"
                      y1={sup.yRatio * 600}
                      x2="1000"
                      y2={sup.yRatio * 600}
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                      strokeDasharray="6 3"
                    />
                    <text
                      x="985"
                      y={sup.yRatio * 600 - 6}
                      fill="#60a5fa"
                      fontFamily="monospace"
                      fontSize="11"
                      textAnchor="end"
                      fontWeight="600"
                    >
                      {sup.label}
                    </text>
                  </g>
                ))}
                {analysis.keyLevels?.resistances?.map((res, idx) => (
                  <g key={`res-${idx}`}>
                    <line
                      x1="0"
                      y1={res.yRatio * 600}
                      x2="1000"
                      y2={res.yRatio * 600}
                      stroke="#f97316"
                      strokeWidth="1.5"
                      strokeDasharray="6 3"
                    />
                    <text
                      x="985"
                      y={res.yRatio * 600 - 6}
                      fill="#fb923c"
                      fontFamily="monospace"
                      fontSize="11"
                      textAnchor="end"
                      fontWeight="600"
                    >
                      {res.label}
                    </text>
                  </g>
                ))}
              </>
            )}

            {/* 4. Entry Zone / Order Block (Alpha Blended Rectangle) */}
            {showEntryZone && analysis.entryZone && (
              <g>
                {/* Translucent filled order block */}
                <rect
                  x={(analysis.entryZone.xRatio - analysis.entryZone.widthRatio / 2) * 1000}
                  y={(analysis.entryZone.yRatio - analysis.entryZone.heightRatio / 2) * 600}
                  width={analysis.entryZone.widthRatio * 1000}
                  height={analysis.entryZone.heightRatio * 600}
                  fill={isCall ? '#22c55e' : '#ef4444'}
                  fillOpacity={opacity}
                  stroke={isCall ? '#22c55e' : '#ef4444'}
                  strokeWidth="2"
                  rx="4"
                />
                <rect
                  x={(analysis.entryZone.xRatio - analysis.entryZone.widthRatio / 2) * 1000}
                  y={Math.max(15, (analysis.entryZone.yRatio - analysis.entryZone.heightRatio / 2) * 600 - 20)}
                  width="145"
                  height="18"
                  fill="#0f172a"
                  stroke={isCall ? '#22c55e' : '#ef4444'}
                  strokeWidth="1"
                  rx="3"
                />
                <text
                  x={(analysis.entryZone.xRatio - analysis.entryZone.widthRatio / 2) * 1000 + 6}
                  y={Math.max(28, (analysis.entryZone.yRatio - analysis.entryZone.heightRatio / 2) * 600 - 7)}
                  fill={isCall ? '#4ade80' : '#f87171'}
                  fontFamily="monospace"
                  fontSize="10"
                  fontWeight="bold"
                >
                  ZONA DE ENTRADA ({analysis.direction})
                </text>
              </g>
            )}

            {/* 5. Next Projected Candle (Ghost Candle) */}
            {showProjectedCandle && analysis.nextCandleProjection && (
              <g className="animate-pulse">
                {/* Glow Filter */}
                <defs>
                  <filter id="candle-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Wick */}
                <line
                  x1={analysis.nextCandleProjection.xRatio * 1000}
                  y1={analysis.nextCandleProjection.highYRatio * 600}
                  x2={analysis.nextCandleProjection.xRatio * 1000}
                  y2={analysis.nextCandleProjection.lowYRatio * 600}
                  stroke={isCall ? '#4ade80' : '#f87171'}
                  strokeWidth="2.5"
                />

                {/* Candle Body */}
                <rect
                  x={analysis.nextCandleProjection.xRatio * 1000 - 14}
                  y={Math.min(
                    analysis.nextCandleProjection.openYRatio * 600,
                    analysis.nextCandleProjection.closeYRatio * 600
                  )}
                  width="28"
                  height={Math.max(
                    6,
                    Math.abs(
                      analysis.nextCandleProjection.closeYRatio * 600 -
                        analysis.nextCandleProjection.openYRatio * 600
                    )
                  )}
                  fill={isCall ? '#22c55e' : '#ef4444'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  rx="2"
                  filter="url(#candle-glow)"
                />

                {/* Badge Label */}
                <rect
                  x={analysis.nextCandleProjection.xRatio * 1000 - 100}
                  y={Math.min(
                    analysis.nextCandleProjection.openYRatio * 600,
                    analysis.nextCandleProjection.closeYRatio * 600
                  ) - 24}
                  width="92"
                  height="20"
                  fill="#0b1120"
                  stroke={isCall ? '#22c55e' : '#ef4444'}
                  strokeWidth="1"
                  rx="4"
                />
                <text
                  x={analysis.nextCandleProjection.xRatio * 1000 - 94}
                  y={Math.min(
                    analysis.nextCandleProjection.openYRatio * 600,
                    analysis.nextCandleProjection.closeYRatio * 600
                  ) - 10}
                  fill="#ffffff"
                  fontFamily="sans-serif"
                  fontSize="10"
                  fontWeight="bold"
                >
                  ⚡ PRÓX. VELA 1M
                </text>
              </g>
            )}
          </svg>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
            <span>Alvo / Compra (TP)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
            <span>Stop / Venda (SL)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" />
            <span>Suporte</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-orange-500 inline-block" />
            <span>Resistência</span>
          </span>
        </div>

        <div className="font-mono text-[11px] text-slate-500">
          Alpha Blending: cv2.addWeighted(overlay, {opacity}, img, {(1 - opacity).toFixed(2)}, 0)
        </div>
      </div>
    </div>
  );
};
