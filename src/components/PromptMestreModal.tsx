import React, { useState } from 'react';
import { Copy, Check, X, BookOpen, Bot, Sparkles, Shield, Sliders } from 'lucide-react';

interface PromptMestreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MASTER_PROMPT_DEFAULT = `[INÍCIO DO PROMPT DE SISTEMA]
ROLE: Você é um Trader Algorítmico Sênior e Especialista em Visão Computacional Financeira. Sua tarefa é analisar imagens de gráficos de candlestick (timeframe 1m) e prever o movimento da próxima vela com base em Price Action, Volume e Estrutura de Mercado.

OBJETIVO:
1. Analisar a imagem do gráfico fornecida.
2. Identificar tendências (alta/baixa), suportes, resistências e padrões de velas (engolfo, doji, martelo, etc.).
3. Calcular a probabilidade (%) da direção da próxima vela.
4. Gerar um código Python (usando OpenCV e Matplotlib) que desenhe sobre a imagem original uma visualização preditiva (similar a um heatmap ou blocos de ordem), mostrando zonas de entrada e saída.

REGRAS DE ANÁLISE:
- Se o preço está fazendo topos descendentes e fundos descendentes -> Tendência de Baixa (Bearish).
- Se houver rejeição forte em uma zona (pavio longo) -> Possível reversão.
- Considere o momentum das últimas 3-5 velas.

FORMATO DE RESPOSTA:
1. Análise Textual: Resumo curto do que está acontecendo.
2. Previsão: Direção (Call/Put ou Long/Short) e Probabilidade (ex: 75%).
3. Código de Visualização: Um script Python completo que:
   - Carrega a imagem.
   - Desenha retângulos coloridos (Verde para zona de compra/alvo, Vermelho para stop/zona de venda).
   - Desenha linhas horizontais nos níveis chave identificados.
   - Salva a nova imagem com as anotações.
[FIM DO PROMPT DE SISTEMA]`;

export const PromptMestreModal: React.FC<PromptMestreModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [strategy, setStrategy] = useState<'geral' | 'scalping_ob' | 'crypto_futures'>('geral');
  const [minProb, setMinProb] = useState<number>(75);

  if (!isOpen) return null;

  const getCustomizedPrompt = () => {
    let extra = '';
    if (strategy === 'scalping_ob') {
      extra = `\nCONFIGURAÇÃO ESPECÍFICA: FOCO EM SCALPING 1M (OPÇÕES BINÁRIAS / IQ OPTION / POCKET OPTION / QUOTEX):
- Operações de expiração de exatamente 1 vela (1 minuto).
- Priorize entradas de retração em taxas de suporte/resistência (M1) e rompimentos com confirmação de fluxo.
- Filtro de segurança: Apenas recomende CALL ou PUT se a probabilidade for >= ${minProb}%. Caso contrário, sinalize ESPERAR / NEUTRO.`;
    } else if (strategy === 'crypto_futures') {
      extra = `\nCONFIGURAÇÃO ESPECÍFICA: CRIPTO FUTUROS 1M (BINANCE / BYBIT):
- Foco em Liquidity Sweeps (captura de liquidez em topos/fundos), Fair Value Gaps (FVG) e Order Blocks institucionais.
- Especifique Stop Loss técnico e Alvos de Take Profit com relação Risco:Retorno mínima de 1:2.0.
- Filtro de probabilidade mínima: ${minProb}%.`;
    }

    return `${MASTER_PROMPT_DEFAULT}${extra}`;
  };

  const currentPrompt = getCustomizedPrompt();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Parte 1: O Prompt Mestre do Sistema</h3>
              <p className="text-xs text-slate-400">Instruções personalizadas para configurar ChatGPT-4o, Claude 3.5 ou Gemini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Strategy Selector */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Modalidade:</span>
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setStrategy('geral')}
                className={`px-3 py-1 rounded transition-colors ${
                  strategy === 'geral' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Padrão (Geral 1M)
              </button>
              <button
                onClick={() => setStrategy('scalping_ob')}
                className={`px-3 py-1 rounded transition-colors ${
                  strategy === 'scalping_ob' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Opções Binárias (1m)
              </button>
              <button
                onClick={() => setStrategy('crypto_futures')}
                className={`px-3 py-1 rounded transition-colors ${
                  strategy === 'crypto_futures' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Cripto Futuros
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Filtro Mínimo:</span>
            <select
              value={minProb}
              onChange={(e) => setMinProb(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
            >
              <option value={70}>Probabilidade ≥ 70%</option>
              <option value={75}>Probabilidade ≥ 75%</option>
              <option value={80}>Probabilidade ≥ 80%</option>
              <option value={85}>Probabilidade ≥ 85%</option>
            </select>
          </div>
        </div>

        {/* Prompt Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="bg-[#0b101c] p-4 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed text-slate-300 select-all whitespace-pre-wrap">
            {currentPrompt}
          </div>

          {/* Quick Guide */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs text-slate-400">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Como usar este prompt mestre:
            </div>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Clique no botão <strong>"Copiar Prompt Mestre"</strong> abaixo.</li>
              <li>Cole no campo de <em>Instruções Personalizadas (Custom Instructions)</em> do seu assistente de IA preferido (ou como primeira mensagem).</li>
              <li>Envie uma captura de tela do seu gráfico de 1m para receber a análise e as coordenadas de overlay.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-500">
            Pronto para colar no ChatGPT, Claude ou Gemini
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-950 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Prompt Mestre Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Prompt Mestre</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
