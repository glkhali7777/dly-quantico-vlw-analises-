import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, ExternalLink, Code2, Play } from 'lucide-react';

interface PythonScriptViewerProps {
  script: string;
  direction?: string;
  probability?: number;
}

export const PythonScriptViewer: React.FC<PythonScriptViewerProps> = ({
  script,
  direction = 'CALL',
  probability = 75,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'instructions'>('script');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleDownloadPy = () => {
    const blob = new Blob([script], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `overlay_preditivo_1m_${direction.toLowerCase()}.py`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono text-xs text-slate-200 font-bold uppercase tracking-wider">
            Código Python Gerado (OpenCV + Matplotlib)
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
            Parte 2 do Sistema
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('script')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'script' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Script Completo
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'instructions' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Como Rodar
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
            title="Copiar código para a área de transferência"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Copiar Código</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
            title="Baixar arquivo .py"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Baixar .py</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'script' ? (
        <div className="relative bg-[#0d1117] p-4 max-h-[460px] overflow-auto">
          <pre className="font-mono text-xs leading-relaxed text-slate-300 select-all">
            <code>{script}</code>
          </pre>
        </div>
      ) : (
        <div className="p-5 bg-slate-950 space-y-4 text-xs text-slate-300">
          <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg">
            <h4 className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> Opção 1: Executar no Google Colab (Grátis na Nuvem)
            </h4>
            <p className="text-slate-300 mb-2">
              Não precisa instalar nada no computador. Abra o Google Colab e cole o comando de instalação:
            </p>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 font-mono text-emerald-400 select-all">
              !pip install opencv-python matplotlib numpy
            </div>
            <p className="mt-2 text-slate-400">
              Em seguida, faça upload da sua imagem do gráfico no Colab e rode a função{' '}
              <code className="text-cyan-300">draw_prediction_overlay('seu_grafico.png', prediction_info)</code>.
            </p>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Play className="w-4 h-4 text-indigo-400" /> Opção 2: Executar no Computador Local (VSCode / Terminal)
            </h4>
            <p className="text-slate-300 mb-2">Instale as bibliotecas necessárias com o pip:</p>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-amber-300 select-all">
              pip install opencv-python matplotlib numpy
            </div>
            <p className="mt-2 text-slate-400">
              Salve o script baixado na mesma pasta da imagem do seu gráfico e execute:{' '}
              <code className="text-indigo-300 font-mono">python overlay_preditivo_1m.py</code>.
            </p>
          </div>

          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-emerald-300">
            <span className="font-semibold">💡 Dica AI Studio:</span> O visualizador interativo acima já desenha a
            sobreposição em tempo real no seu navegador e você pode baixar a imagem pronta clicando no botão{' '}
            <strong>"Baixar Imagem Editada"</strong> sem precisar rodar Python se preferir agilidade!
          </div>
        </div>
      )}

      {/* Footer bar */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Compatível com OpenCV 4.x • Matplotlib 3.x • Python 3.9+</span>
        <span className="text-slate-400">Direção: {direction} ({probability}%)</span>
      </div>
    </div>
  );
};
