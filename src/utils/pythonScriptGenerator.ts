import { AnalysisResult } from '../types';

export function generatePythonOpenCvScript(analysis: Partial<AnalysisResult>, imageName: string = 'grafico_1m.png'): string {
  const direction = analysis.direction || 'CALL';
  const prob = analysis.probability || 75;
  const isCall = direction === 'CALL';
  
  const targetY = analysis.keyLevels?.targetYRatio ?? (isCall ? 0.35 : 0.85);
  const stopY = analysis.keyLevels?.stopLossYRatio ?? (isCall ? 0.85 : 0.35);
  
  const entryX = analysis.entryZone?.xRatio ?? 0.88;
  const entryY = analysis.entryZone?.yRatio ?? 0.60;
  const entryW = analysis.entryZone?.widthRatio ?? 0.10;
  const entryH = analysis.entryZone?.heightRatio ?? 0.12;
  
  const x1 = Math.max(0, entryX - entryW / 2).toFixed(3);
  const x2 = Math.min(1, entryX + entryW / 2).toFixed(3);
  const y1 = Math.max(0, entryY - entryH / 2).toFixed(3);
  const y2 = Math.min(1, entryY + entryH / 2).toFixed(3);

  const supports = analysis.keyLevels?.supports || [];
  const resistances = analysis.keyLevels?.resistances || [];

  return `import cv2
import numpy as np
import matplotlib.pyplot as plt

def draw_prediction_overlay(image_path, prediction_data):
    """
    Script de Visão Computacional para Análise Preditiva de Candlestick 1m
    Baseado em Price Action, Momentum e Detecção de Estrutura de Mercado.
    Previsão: ${direction} (${prob}%)
    """
    # 1. Carregar a imagem do gráfico
    img = cv2.imread(image_path)
    if img is None:
        print(f"Erro ao carregar a imagem: {image_path}")
        return

    # Converter BGR para RGB para renderização correta
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    h, w, _ = img_rgb.shape
    
    # Criar camada para o overlay translúcido
    overlay = img_rgb.copy()

    # 2. Zona de Entrada / Order Block
    # Coordenadas relativas calculadas pela IA
    box_x1 = int(w * ${x1})
    box_y1 = int(h * ${y1})
    box_x2 = int(w * ${x2})
    box_y2 = int(h * ${y2})

    # Cor BGR: Verde para Compra (0, 230, 115) ou Vermelho para Venda (235, 60, 60)
    box_color = (${isCall ? '34, 197, 94' : '239, 68, 68'})
    cv2.rectangle(overlay, (box_x1, box_y1), (box_x2, box_y2), box_color, -1)
    
    # Aplicar transparência (Alpha Blending 40%)
    alpha = 0.4
    result = cv2.addWeighted(overlay, alpha, img_rgb, 1 - alpha, 0)

    # Contorno da zona de entrada
    cv2.rectangle(result, (box_x1, box_y1), (box_x2, box_y2), box_color, 2)
    cv2.putText(result, 'ZONA DE ENTRADA (${direction})', (box_x1, max(20, box_y1 - 10)), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, box_color, 2)

    # 3. Desenhar Linha de ALVO (Take Profit)
    target_y = int(h * ${targetY.toFixed(3)})
    cv2.line(result, (0, target_y), (w, target_y), (34, 197, 94), 2)
    cv2.putText(result, f'ALVO (TP) - {prediction_data.get("direction", "${direction}")} ${prob}%', 
                (15, max(25, target_y - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (34, 197, 94), 2)

    # 4. Desenhar Linha de STOP LOSS
    stop_y = int(h * ${stopY.toFixed(3)})
    cv2.line(result, (0, stop_y), (w, stop_y), (239, 68, 68), 2)
    cv2.putText(result, 'STOP LOSS', (15, min(h - 10, stop_y + 22)), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (239, 68, 68), 2)

    # 5. Desenhar Níveis Chave de Suporte e Resistência identificados
${supports.map((s, idx) => `    # Suporte ${idx + 1}
    sup_y_${idx} = int(h * ${s.yRatio.toFixed(3)})
    cv2.line(result, (0, sup_y_${idx}), (w, sup_y_${idx}), (59, 130, 246), 1, cv2.LINE_AA)
    cv2.putText(result, '${s.label}', (w - 180, sup_y_${idx} - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (59, 130, 246), 1)`).join('\n') || '    # Sem suportes secundários'}

${resistances.map((r, idx) => `    # Resistência ${idx + 1}
    res_y_${idx} = int(h * ${r.yRatio.toFixed(3)})
    cv2.line(result, (0, res_y_${idx}), (w, res_y_${idx}), (249, 115, 22), 1, cv2.LINE_AA)
    cv2.putText(result, '${r.label}', (w - 180, res_y_${idx} - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (249, 115, 22), 1)`).join('\n') || '    # Sem resistências secundárias'}

    # 6. Salvar e Exibir o resultado
    output_path = 'predicao_overlay_1m.png'
    cv2.imwrite(output_path, cv2.cvtColor(result, cv2.COLOR_RGB2BGR))
    print(f"Imagem preditiva salva com sucesso em: {output_path}")

    plt.figure(figsize=(14, 7), dpi=100)
    plt.imshow(result)
    plt.axis('off')
    plt.title("Trader Algorítmico 1m - Visão Computacional Preditiva", fontsize=14, pad=12)
    plt.tight_layout()
    plt.show()

# Parâmetros detectados pela IA
prediction_info = {
    'direction': '${direction}',
    'probability': ${prob},
    'trend': '${analysis.trend || (isCall ? 'Alta' : 'Baixa')}',
    'timeframe': '${analysis.timeframe || '1m'}'
}

# Executar na imagem do gráfico
draw_prediction_overlay('${imageName}', prediction_info)
`;
}
