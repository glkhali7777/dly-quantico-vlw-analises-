export type Direction = 'CALL' | 'PUT' | 'NEUTRAL';
export type TradeAction = 'BUY / LONG' | 'SELL / SHORT' | 'WAIT';

export interface CandlestickPattern {
  name: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  description: string;
  location?: string;
}

export interface KeyLevel {
  yRatio: number; // 0.0 top, 1.0 bottom
  label: string;
  price?: string;
  strength?: 'forte' | 'média' | 'fraca';
}

export interface EntryZone {
  xRatio: number; // 0.0 to 1.0
  yRatio: number; // 0.0 to 1.0
  widthRatio: number;
  heightRatio: number;
  label: string;
  type: 'buy' | 'sell';
}

export interface OrderBlock {
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  type: 'bullish_ob' | 'bearish_ob' | 'liquidity_pool';
  label: string;
}

export interface ProjectedCandle {
  direction: 'bullish' | 'bearish';
  xRatio: number;
  openYRatio: number;
  closeYRatio: number;
  highYRatio: number;
  lowYRatio: number;
  expectedSize: 'grande' | 'média' | 'pequena';
  description: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  assetName?: string;
  timeframe: string;
  direction: Direction;
  tradeAction: TradeAction;
  probability: number; // e.g., 78 for 78%
  confidence: 'Alta' | 'Média' | 'Baixa';
  trend: 'Alta (Bullish)' | 'Baixa (Bearish)' | 'Lateral / Consolidação';
  marketStructure: string;
  momentumAnalysis: string;
  textSummary: string;
  riskRewardRatio: string;
  identifiedPatterns: CandlestickPattern[];
  keyLevels: {
    targetYRatio: number;
    targetLabel: string;
    stopLossYRatio: number;
    stopLossLabel: string;
    supports: KeyLevel[];
    resistances: KeyLevel[];
  };
  entryZone: EntryZone;
  orderBlocks?: OrderBlock[];
  nextCandleProjection: ProjectedCandle;
  pythonScript: string;
  rulesChecked: {
    rule: string;
    status: 'pass' | 'warning' | 'alert';
    detail: string;
  }[];
  isHeuristicFallback?: boolean;
  modelUsed?: string;
  notice?: string;
}

export interface SampleChart {
  id: string;
  title: string;
  patternName: string;
  direction: Direction;
  probability: number;
  description: string;
  timeframe: string;
  imageUrl: string;
  presetAnalysis: AnalysisResult;
}
