import { SampleChart } from '../types';
import { generatePythonOpenCvScript } from '../utils/pythonScriptGenerator';

// Helper to create high-fidelity candlestick chart SVG data URLs
function generateCandlestickSvg(candles: Array<{ o: number; h: number; l: number; c: number; v: number }>, title: string): string {
  const width = 800;
  const height = 450;
  const paddingLeft = 30;
  const paddingRight = 70;
  const paddingTop = 40;
  const paddingBottom = 60;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  let minPrice = Math.min(...candles.map(c => c.l));
  let maxPrice = Math.max(...candles.map(c => c.h));
  const spread = maxPrice - minPrice || 1;
  minPrice -= spread * 0.08;
  maxPrice += spread * 0.08;
  const range = maxPrice - minPrice;

  const getY = (val: number) => paddingTop + chartH - ((val - minPrice) / range) * chartH;
  const candleW = Math.max(8, (chartW / candles.length) * 0.65);
  const stepX = chartW / candles.length;

  let gridSvg = '';
  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = paddingTop + (chartH / 5) * i;
    const priceVal = maxPrice - (range / 5) * i;
    gridSvg += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="#1e293b" stroke-dasharray="3,3" stroke-width="1"/>
      <text x="${width - paddingRight + 8}" y="${y + 4}" fill="#64748b" font-family="monospace" font-size="11">${priceVal.toFixed(4)}</text>
    `;
  }

  let candlesSvg = '';
  let volumeSvg = '';
  const maxVol = Math.max(...candles.map(c => c.v));

  candles.forEach((c, i) => {
    const cx = paddingLeft + i * stepX + stepX / 2;
    const isUp = c.c >= c.o;
    const color = isUp ? '#22c55e' : '#ef4444';
    const fill = isUp ? '#22c55e' : '#ef4444';

    const yOpen = getY(c.o);
    const yClose = getY(c.c);
    const yHigh = getY(c.h);
    const yLow = getY(c.l);

    const bodyY = Math.min(yOpen, yClose);
    const bodyH = Math.max(3, Math.abs(yClose - yOpen));

    // Wick
    candlesSvg += `<line x1="${cx}" y1="${yHigh}" x2="${cx}" y2="${yLow}" stroke="${color}" stroke-width="1.5"/>`;
    // Body
    candlesSvg += `<rect x="${cx - candleW / 2}" y="${bodyY}" width="${candleW}" height="${bodyH}" fill="${fill}" rx="1"/>`;

    // Volume bar
    const vH = (c.v / maxVol) * 45;
    const vY = height - paddingBottom - vH;
    volumeSvg += `<rect x="${cx - candleW / 2}" y="${vY}" width="${candleW}" height="${vH}" fill="${isUp ? '#22c55e33' : '#ef444433'}"/>`;
  });

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="#0f172a"/>
      <rect x="${paddingLeft}" y="${paddingTop}" width="${chartW}" height="${chartH}" fill="#0b1120" stroke="#1e293b" stroke-width="1"/>
      
      <!-- Grid -->
      ${gridSvg}
      
      <!-- Volumes -->
      ${volumeSvg}
      
      <!-- Candles -->
      ${candlesSvg}

      <!-- Watermark & Header -->
      <text x="${paddingLeft + 15}" y="${paddingTop + 24}" fill="#38bdf8" font-family="sans-serif" font-weight="700" font-size="14">${title} [1M]</text>
      <text x="${paddingLeft + 15}" y="${paddingTop + 42}" fill="#64748b" font-family="sans-serif" font-size="11">CANDLESTICK PRICE ACTION &bull; VOLUME SPREAD</text>
      <text x="${width - paddingRight - 10}" y="${height - 20}" fill="#475569" font-family="monospace" font-size="10" text-anchor="end">TIMEFRAME 1M &bull; REAL-TIME FEED</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 1. Hammer Reversal at Support (CALL)
const hammerCandles = [
  { o: 1.0840, h: 1.0845, l: 1.0832, c: 1.0834, v: 45 },
  { o: 1.0834, h: 1.0838, l: 1.0825, c: 1.0827, v: 60 },
  { o: 1.0827, h: 1.0830, l: 1.0818, c: 1.0820, v: 75 },
  { o: 1.0820, h: 1.0824, l: 1.0810, c: 1.0812, v: 90 },
  { o: 1.0812, h: 1.0816, l: 1.0805, c: 1.0808, v: 110 },
  { o: 1.0808, h: 1.0812, l: 1.0802, c: 1.0804, v: 80 },
  { o: 1.0804, h: 1.0818, l: 1.0790, c: 1.0815, v: 165 }, // Long lower wick hammer!
];

// 2. Bearish Engulfing at Resistance (PUT)
const engulfingCandles = [
  { o: 1.2510, h: 1.2520, l: 1.2505, c: 1.2518, v: 50 },
  { o: 1.2518, h: 1.2532, l: 1.2515, c: 1.2530, v: 65 },
  { o: 1.2530, h: 1.2545, l: 1.2528, c: 1.2542, v: 85 },
  { o: 1.2542, h: 1.2558, l: 1.2540, c: 1.2555, v: 100 },
  { o: 1.2555, h: 1.2562, l: 1.2550, c: 1.2558, v: 55 }, // Exhaustion small candle
  { o: 1.2558, h: 1.2560, l: 1.2532, c: 1.2535, v: 145 }, // Strong bearish engulfing!
];

// 3. Lower Highs Lower Lows Breakdown (PUT)
const breakdownCandles = [
  { o: 65400, h: 65480, l: 65350, c: 65370, v: 120 },
  { o: 65370, h: 65420, l: 65310, c: 65330, v: 95 },
  { o: 65330, h: 65390, l: 65280, c: 65290, v: 110 },
  { o: 65290, h: 65320, l: 65200, c: 65220, v: 140 },
  { o: 65220, h: 65260, l: 65150, c: 65160, v: 185 },
  { o: 65160, h: 65190, l: 65020, c: 65050, v: 240 }, // Strong momentum breakdown
];

// 4. Morning Star Reversal (CALL)
const morningStarCandles = [
  { o: 2450, h: 2455, l: 2420, c: 2425, v: 130 }, // Big red
  { o: 2424, h: 2428, l: 2410, c: 2415, v: 90 }, // Gap down small doji/spinning top
  { o: 2416, h: 2448, l: 2415, c: 2445, v: 175 }, // Strong green closing deep into candle 1
];

export const SAMPLE_CHARTS: SampleChart[] = [
  {
    id: 'sample-hammer',
    title: 'EUR/USD - Martelo em Suporte Forte',
    patternName: 'Martelo de Alta (Bullish Hammer) com Pavio Longo',
    direction: 'CALL',
    probability: 84,
    description: 'Forte rejeição compradora na zona de suporte psicológico. Pavio inferior triplo em relação ao corpo, indicando absorção e entrada maciça de touros.',
    timeframe: '1m',
    imageUrl: generateCandlestickSvg(hammerCandles, 'EUR/USD MARTELO SUPORTE'),
    presetAnalysis: {
      id: 'analysis-hammer',
      timestamp: Date.now(),
      assetName: 'EUR/USD',
      timeframe: '1m',
      direction: 'CALL',
      tradeAction: 'BUY / LONG',
      probability: 84,
      confidence: 'Alta',
      trend: 'Alta (Bullish)',
      marketStructure: 'Reversão de Fundo com Absorção de Liquidez em Suporte Chave',
      momentumAnalysis: 'As últimas 3 velas vinham em desaceleração com volumes decrescentes até a vela atual, onde o volume disparou 120% formando rejeição em V.',
      textSummary: 'Identificado padrão de Martelo clássico no timeframe de 1m exatamente em zona de suporte histórico. O pavio inferior expressivo confirma rejeição de preços mais baixos e entrada de fluxo institucional. Próxima vela tem 84% de probabilidade de continuar o movimento de alta em direção à média móvel e resistência anterior.',
      riskRewardRatio: '1:2.8',
      identifiedPatterns: [
        {
          name: 'Martelo (Hammer)',
          sentiment: 'bullish',
          description: 'Pavio inferior medindo 3x o tamanho do corpo em região de demanda.',
          location: 'Vela 7 (Atual)'
        },
        {
          name: 'Exaustão Vendedora',
          sentiment: 'bullish',
          description: 'Diminuição progressiva do corpo das velas vendedoras anteriores.',
          location: 'Velas 4-6'
        }
      ],
      keyLevels: {
        targetYRatio: 0.28,
        targetLabel: 'ALVO (TP) - 1.0838',
        stopLossYRatio: 0.88,
        stopLossLabel: 'STOP LOSS - 1.0788',
        supports: [
          { yRatio: 0.82, label: 'Suporte Institucional 1.0790', strength: 'forte' }
        ],
        resistances: [
          { yRatio: 0.28, label: 'Resistência Local 1.0838', strength: 'forte' },
          { yRatio: 0.45, label: 'Fair Value Gap 1.0825', strength: 'média' }
        ]
      },
      entryZone: {
        xRatio: 0.88,
        yRatio: 0.72,
        widthRatio: 0.12,
        heightRatio: 0.15,
        label: 'Zona de Compra / Order Block Bullish',
        type: 'buy'
      },
      nextCandleProjection: {
        direction: 'bullish',
        xRatio: 0.96,
        openYRatio: 0.70,
        closeYRatio: 0.50,
        highYRatio: 0.45,
        lowYRatio: 0.72,
        expectedSize: 'grande',
        description: 'Vela de impulsão compradora verde rompendo a máxima do martelo.'
      },
      rulesChecked: [
        { rule: 'Topos e Fundos Descendentes', status: 'warning', detail: 'Estrutura anterior era de baixa, mas sofreu quebra de caráter (CHoCH).' },
        { rule: 'Rejeição Forte (Pavio Longo)', status: 'pass', detail: 'Pavio inferior corresponde a 75% da amplitude total da vela.' },
        { rule: 'Momentum 3-5 Velas', status: 'pass', detail: 'Inversão clara de delta com volume 2.1x acima da média.' }
      ],
      pythonScript: '' // will be populated
    }
  },
  {
    id: 'sample-engulfing',
    title: 'GBP/USD - Engolfo de Baixa na Resistência',
    patternName: 'Engolfo de Baixa (Bearish Engulfing)',
    direction: 'PUT',
    probability: 81,
    description: 'Após sequência de velas compradoras fracas na resistência, a vela atual engolfou completamente o corpo da anterior com forte aceleração.',
    timeframe: '1m',
    imageUrl: generateCandlestickSvg(engulfingCandles, 'GBP/USD ENGOLFO RESISTENCIA'),
    presetAnalysis: {
      id: 'analysis-engulfing',
      timestamp: Date.now(),
      assetName: 'GBP/USD',
      timeframe: '1m',
      direction: 'PUT',
      tradeAction: 'SELL / SHORT',
      probability: 81,
      confidence: 'Alta',
      trend: 'Baixa (Bearish)',
      marketStructure: 'Falha de Rompimento de Topo (Liquidity Sweep) e Reversão Bearish',
      momentumAnalysis: 'A vela 5 apresentou pequeno corpo demonstrando exaustão no topo. A vela atual abriu em teste e desabou cobrindo 100% da vela compradora anterior.',
      textSummary: 'Padrão de Engolfo de Baixa confirmado no 1m com rejeição explícita do nível de resistência 1.2560. A força vendedora tomou o controle absoluto do livro de ordens, projetando continuidade imediata na próxima vela.',
      riskRewardRatio: '1:2.4',
      identifiedPatterns: [
        {
          name: 'Engolfo de Baixa (Bearish Engulfing)',
          sentiment: 'bearish',
          description: 'Corpo vermelho engolfa 140% do corpo verde anterior.',
          location: 'Vela 6 (Atual)'
        },
        {
          name: 'Vela de Exaustão (Doji/Peão)',
          sentiment: 'bearish',
          description: 'Perca de ímpeto compradora no topo.',
          location: 'Vela 5'
        }
      ],
      keyLevels: {
        targetYRatio: 0.82,
        targetLabel: 'ALVO (TP) - 1.2515',
        stopLossYRatio: 0.20,
        stopLossLabel: 'STOP LOSS - 1.2565',
        supports: [
          { yRatio: 0.82, label: 'Suporte Fundo 1.2515', strength: 'forte' }
        ],
        resistances: [
          { yRatio: 0.22, label: 'Resistência Testada 1.2560', strength: 'forte' }
        ]
      },
      entryZone: {
        xRatio: 0.88,
        yRatio: 0.38,
        widthRatio: 0.12,
        heightRatio: 0.16,
        label: 'Zona de Venda / Order Block Bearish',
        type: 'sell'
      },
      nextCandleProjection: {
        direction: 'bearish',
        xRatio: 0.96,
        openYRatio: 0.40,
        closeYRatio: 0.65,
        highYRatio: 0.38,
        lowYRatio: 0.70,
        expectedSize: 'grande',
        description: 'Vela de continuidade vermelha buscando liquidez nos fundos anteriores.'
      },
      rulesChecked: [
        { rule: 'Topos Descendentes', status: 'pass', detail: 'Topo duplo com rejeição milimétrica na resistência.' },
        { rule: 'Rejeição Forte', status: 'pass', detail: 'Fechamento na mínima da vela sem pavio inferior expressivo.' },
        { rule: 'Momentum 3-5 Velas', status: 'pass', detail: 'Volume vendedor 2.5x superior ao da vela compradora anterior.' }
      ],
      pythonScript: ''
    }
  },
  {
    id: 'sample-breakdown',
    title: 'BTC/USDT - Rompimento de Suporte em Tendência de Baixa',
    patternName: 'Topos e Fundos Descendentes + Rompimento (Breakdown)',
    direction: 'PUT',
    probability: 88,
    description: 'Sequência consecutiva de velas vermelhas de alta convicção com topos e fundos descendentes nítidos e rompimento de suporte dinâmico.',
    timeframe: '1m',
    imageUrl: generateCandlestickSvg(breakdownCandles, 'BTC/USDT BREAKDOWN 1M'),
    presetAnalysis: {
      id: 'analysis-breakdown',
      timestamp: Date.now(),
      assetName: 'BTC/USDT',
      timeframe: '1m',
      direction: 'PUT',
      tradeAction: 'SELL / SHORT',
      probability: 88,
      confidence: 'Alta',
      trend: 'Baixa (Bearish)',
      marketStructure: 'Topos Descendentes e Fundos Descendentes (Lower Highs & Lower Lows)',
      momentumAnalysis: 'Momentum extremamente dominante dos ursos nas últimas 5 velas. Sem qualquer presença de compradores para contestar a queda.',
      textSummary: 'Tendência clássica de baixa respeitando à risca a regra mestre: topos descendentes e fundos descendentes com volume em expansão constante. Próxima vela tem probabilidade máxima de 88% de buscar novo fundo.',
      riskRewardRatio: '1:3.2',
      identifiedPatterns: [
        {
          name: 'Três Corvos Negros (Three Black Crows)',
          sentiment: 'bearish',
          description: 'Três ou mais velas de baixa consecutivas fechando na mínima.',
          location: 'Velas 3-6'
        },
        {
          name: 'Marubozu de Baixa',
          sentiment: 'bearish',
          description: 'Corpo longo com quase nenhum pavio, pressão vendedora pura.',
          location: 'Vela 6'
        }
      ],
      keyLevels: {
        targetYRatio: 0.88,
        targetLabel: 'ALVO (TP) - 64,850',
        stopLossYRatio: 0.35,
        stopLossLabel: 'STOP LOSS - 65,300',
        supports: [
          { yRatio: 0.88, label: 'Suporte Psicológico 64,850', strength: 'média' }
        ],
        resistances: [
          { yRatio: 0.35, label: 'Resistência Rompida 65,300', strength: 'forte' }
        ]
      },
      entryZone: {
        xRatio: 0.88,
        yRatio: 0.55,
        widthRatio: 0.12,
        heightRatio: 0.16,
        label: 'Zona de Venda em Rompimento',
        type: 'sell'
      },
      nextCandleProjection: {
        direction: 'bearish',
        xRatio: 0.96,
        openYRatio: 0.58,
        closeYRatio: 0.78,
        highYRatio: 0.56,
        lowYRatio: 0.82,
        expectedSize: 'grande',
        description: 'Vela vermelha expansiva acompanhando o fluxo de rompimento.'
      },
      rulesChecked: [
        { rule: 'Topos e Fundos Descendentes', status: 'pass', detail: 'Estrutura perfeita de topos e fundos menores em cascata.' },
        { rule: 'Rejeição Forte', status: 'pass', detail: 'Incapacidade de retração compradora em todos os testes.' },
        { rule: 'Momentum 3-5 Velas', status: 'pass', detail: 'Velocidade e amplitude das velas aumentando gradativamente.' }
      ],
      pythonScript: ''
    }
  },
  {
    id: 'sample-morning-star',
    title: 'ETH/USDT - Estrela da Manhã (Morning Star)',
    patternName: 'Estrela da Manhã (Morning Star Reversal)',
    direction: 'CALL',
    probability: 79,
    description: 'Padrão triplo de candlestick: vela forte de baixa, vela intermediária de indecisão (estrela) e vela forte de confirmação de alta.',
    timeframe: '1m',
    imageUrl: generateCandlestickSvg(morningStarCandles, 'ETH/USDT MORNING STAR'),
    presetAnalysis: {
      id: 'analysis-morning-star',
      timestamp: Date.now(),
      assetName: 'ETH/USDT',
      timeframe: '1m',
      direction: 'CALL',
      tradeAction: 'BUY / LONG',
      probability: 79,
      confidence: 'Alta',
      trend: 'Alta (Bullish)',
      marketStructure: 'Reversão Estrutural em 3 Tempos com Fundo Duplo Arredondado',
      momentumAnalysis: 'A pressão vendedora cessou na vela 2 e foi suplantada pela resposta compradora agressiva na vela 3, engolindo 80% da perda anterior.',
      textSummary: 'Padrão clássico de Estrela da Manhã (Morning Star) confirmado no gráfico de 1m. Este é um dos padrões mais confiáveis da literatura técnica para reversão rápida em scalping.',
      riskRewardRatio: '1:2.1',
      identifiedPatterns: [
        {
          name: 'Estrela da Manhã (Morning Star)',
          sentiment: 'bullish',
          description: 'Conjunto de 3 velas formando fundo em V.',
          location: 'Velas 1-3'
        }
      ],
      keyLevels: {
        targetYRatio: 0.22,
        targetLabel: 'ALVO (TP) - 2,475',
        stopLossYRatio: 0.85,
        stopLossLabel: 'STOP LOSS - 2,408',
        supports: [
          { yRatio: 0.85, label: 'Suporte Fundo da Estrela 2,410', strength: 'forte' }
        ],
        resistances: [
          { yRatio: 0.22, label: 'Resistência de Topo 2,475', strength: 'forte' }
        ]
      },
      entryZone: {
        xRatio: 0.88,
        yRatio: 0.50,
        widthRatio: 0.12,
        heightRatio: 0.16,
        label: 'Zona de Compra / Pullback Rápido',
        type: 'buy'
      },
      nextCandleProjection: {
        direction: 'bullish',
        xRatio: 0.96,
        openYRatio: 0.48,
        closeYRatio: 0.32,
        highYRatio: 0.28,
        lowYRatio: 0.50,
        expectedSize: 'média',
        description: 'Vela de continuidade verde confirmando o rompimento da máxima.'
      },
      rulesChecked: [
        { rule: 'Topos e Fundos Descendentes', status: 'pass', detail: 'Final da pernada de baixa com pivot de alta engatilhado.' },
        { rule: 'Rejeição Forte', status: 'pass', detail: 'Rejeição de novos fundos confirmada pelo doji central.' },
        { rule: 'Momentum 3-5 Velas', status: 'pass', detail: 'Vela verde com amplitude 1.8x maior que o doji anterior.' }
      ],
      pythonScript: ''
    }
  }
];

// Initialize python scripts for presets
SAMPLE_CHARTS.forEach(chart => {
  chart.presetAnalysis.pythonScript = generatePythonOpenCvScript(chart.presetAnalysis, `${chart.id}.png`);
});
