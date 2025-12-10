import { Part } from "@/hooks/usePartsStorageV2";

export interface ComboAnalysisResult {
  compatibility: "Compatible" | "Incompatible";
  overallScore: number;
  comboType: "Attack" | "Defense" | "Stamina" | "Balance";
  
  // Atributos
  totalAttack: number;
  totalDefense: number;
  totalStamina: number;
  
  // Burst Finish Analysis
  burstSusceptibility: number; // 0-1 (0 = resistente, 1 = muito suscetível)
  burstFinishRisk: "Muito Alto" | "Alto" | "Médio" | "Baixo" | "Muito Baixo";
  burstFinishAnalysis: string;
  
  // Análise detalhada
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  bestAgainst: string[];
  weakAgainst: string[];
  
  // Sugestões de peças
  suggestions: {
    part: "Blade" | "Ratchet" | "Bit";
    reason: string;
    alternatives: string[];
  }[];
  
  // Radar chart data
  radarData: {
    label: string;
    value: number;
    max: number;
  }[];
}

// Fórmula de suscetibilidade a Burst Finish
export const calculateBurstSusceptibility = (
  bladeWeight: number,
  bitBurstResistance: number,
  ratchetContactPoints: number,
  ratchetHeightLevel: number
): number => {
  // Normalizar valores para 0-1
  const normalizedWeight = Math.min(bladeWeight / 40, 1); // Max ~40g
  const normalizedBitResistance = Math.min(bitBurstResistance / 100, 1);
  const normalizedContactPoints = Math.min(ratchetContactPoints / 9, 1);
  const normalizedHeight = Math.min(ratchetHeightLevel / 5, 1);

  // Fórmula: quanto maior os valores, menor a suscetibilidade
  const resistance =
    normalizedWeight * 0.3 +
    normalizedBitResistance * 0.4 +
    normalizedContactPoints * 0.2 +
    normalizedHeight * 0.1;

  // Inverter: 1 - resistência = suscetibilidade
  return Math.max(0, Math.min(1, 1 - resistance));
};

// Mapear suscetibilidade para risco
const mapBurstRisk = (
  susceptibility: number
): "Muito Alto" | "Alto" | "Médio" | "Baixo" | "Muito Baixo" => {
  if (susceptibility >= 0.8) return "Muito Alto";
  if (susceptibility >= 0.6) return "Alto";
  if (susceptibility >= 0.4) return "Médio";
  if (susceptibility >= 0.2) return "Baixo";
  return "Muito Baixo";
};

// Gerar análise de Burst Finish
const generateBurstFinishAnalysis = (
  susceptibility: number,
  comboType: string,
  bladeWeight: number,
  bitType?: string
): string => {
  const risk = mapBurstRisk(susceptibility);

  if (comboType === "Stamina") {
    if (susceptibility >= 0.7) {
      return `Este combo de Stamina tem ALTA suscetibilidade a Burst Finish (${(susceptibility * 100).toFixed(0)}%). Bits de Stamina têm shaft fino por design. Recomenda-se usar com Ratchet de altura alta (80mm) e mais pontos de contato para melhorar resistência.`;
    } else if (susceptibility >= 0.5) {
      return `Suscetibilidade moderada a Burst Finish (${(susceptibility * 100).toFixed(0)}%). O combo é viável, mas vulnerável a ataques diretos bem posicionados. Mantenha posição defensiva no estádio.`;
    } else {
      return `Excelente resistência a Burst Finish (${(susceptibility * 100).toFixed(0)}%). Este combo de Stamina é muito estável e resistente a burst. Ideal para Spin Finish.`;
    }
  }

  if (comboType === "Defense") {
    if (susceptibility <= 0.3) {
      return `Resistência máxima a Burst Finish (${(susceptibility * 100).toFixed(0)}%). Este combo defensivo é praticamente à prova de burst. Excelente para absorver ataques.`;
    } else {
      return `Boa resistência a Burst Finish (${(susceptibility * 100).toFixed(0)}%). Combo defensivo confiável com resistência a burst acima da média.`;
    }
  }

  if (comboType === "Attack") {
    if (susceptibility >= 0.6) {
      return `Risco moderado a alto de Burst Finish (${(susceptibility * 100).toFixed(0)}%). Este combo de ataque é agressivo mas vulnerável. Recomenda-se usar Bits com melhor resistência a burst.`;
    } else {
      return `Risco baixo a moderado de Burst Finish (${(susceptibility * 100).toFixed(0)}%). Combo de ataque bem equilibrado com resistência aceitável.`;
    }
  }

  return `Suscetibilidade a Burst Finish: ${(susceptibility * 100).toFixed(0)}%. Risco: ${risk}.`;
};

// Gerar sugestões de peças alternativas
const generateSuggestions = (
  blade: Part,
  ratchet: Part,
  bit: Part,
  allParts: { blades: Part[]; ratchets: Part[]; bits: Part[] },
  burstSusceptibility: number
): ComboAnalysisResult["suggestions"] => {
  const suggestions: ComboAnalysisResult["suggestions"] = [];

  // Se suscetibilidade a burst é muito alta
  if (burstSusceptibility >= 0.7) {
    // Sugerir bit com melhor resistência a burst
    const betterBits = allParts.bits
      .filter((b) => (b.stats.burst || 0) > (bit.stats.burst || 0))
      .slice(0, 2);

    if (betterBits.length > 0) {
      suggestions.push({
        part: "Bit",
        reason: "Bit atual tem baixa resistência a burst. Sugerir bit com melhor resistência.",
        alternatives: betterBits.map((b) => b.name),
      });
    }

    // Sugerir ratchet com mais pontos de contato
    const betterRatchets = allParts.ratchets
      .filter((r) => (r.ratchetData?.contactPoints || 0) > (ratchet.ratchetData?.contactPoints || 0))
      .slice(0, 2);

    if (betterRatchets.length > 0) {
      suggestions.push({
        part: "Ratchet",
        reason: "Ratchet com mais pontos de contato aumentaria resistência a burst.",
        alternatives: betterRatchets.map((r) => r.name),
      });
    }
  }

  // Se ataque é muito baixo
  if (blade.stats.attack < 20) {
    const betterBlades = allParts.blades
      .filter((b) => b.stats.attack > blade.stats.attack)
      .slice(0, 2);

    if (betterBlades.length > 0) {
      suggestions.push({
        part: "Blade",
        reason: "Blade atual tem ataque baixo. Considere uma blade mais agressiva.",
        alternatives: betterBlades.map((b) => b.name),
      });
    }
  }

  return suggestions;
};

export const analyzeCombo = (
  blade: Part | null,
  ratchet: Part | null,
  bit: Part | null,
  comboType: "BX" | "CX",
  allParts: { blades: Part[]; ratchets: Part[]; bits: Part[] }
): ComboAnalysisResult | null => {
  if (!blade || !ratchet || !bit) {
    return null;
  }

  // Verificar compatibilidade
  const cxExcluded = ["Courage", "Reaper", "Arc Wizard", "Dark", "Wolf Hunt", "Pegasus Blast"];
  const isCompatible =
    comboType === "BX" ||
    blade.beyType === "CX" ||
    !cxExcluded.some((cx) => blade.name.includes(cx));

  if (!isCompatible) {
    return {
      compatibility: "Incompatible",
      overallScore: 0,
      comboType: "Balance",
      totalAttack: 0,
      totalDefense: 0,
      totalStamina: 0,
      burstSusceptibility: 1,
      burstFinishRisk: "Muito Alto",
      burstFinishAnalysis: "Incompatibilidade de tipo: Blade CX não pode ser usada em combo BX",
      strengths: [],
      weaknesses: ["Incompatibilidade de tipo"],
      recommendations: ["Selecione uma blade compatível"],
      bestAgainst: [],
      weakAgainst: [],
      suggestions: [],
      radarData: [],
    };
  }

  // Calcular totais
  const totalAttack = (blade.stats.attack || 0) + (ratchet.stats.attack || 0) + (bit.stats.attack || 0);
  const totalDefense =
    (blade.stats.defense || 0) + (ratchet.stats.defense || 0) + (bit.stats.defense || 0);
  const totalStamina =
    (blade.stats.stamina || 0) + (ratchet.stats.stamina || 0) + (bit.stats.stamina || 0);

  const overallScore = Math.round((totalAttack + totalDefense + totalStamina) / 3);

  // Determinar tipo de combo
  const maxStat = Math.max(totalAttack, totalDefense, totalStamina);
  let comboRole: "Attack" | "Defense" | "Stamina" | "Balance" = "Balance";

  if (totalAttack === maxStat && totalAttack > 100) comboRole = "Attack";
  else if (totalDefense === maxStat && totalDefense > 100) comboRole = "Defense";
  else if (totalStamina === maxStat && totalStamina > 100) comboRole = "Stamina";

  // Calcular suscetibilidade a Burst Finish
  const bladeWeight = blade.stats.attack + blade.stats.defense; // Proxy para peso
  const bitBurstResistance = bit.stats.burst || 50;
  const ratchetContactPoints = ratchet.ratchetData?.contactPoints || 3;
  const ratchetHeightLevel = ratchet.ratchetData?.heightLevel || 2;

  const burstSusceptibility = calculateBurstSusceptibility(
    bladeWeight,
    bitBurstResistance,
    ratchetContactPoints,
    ratchetHeightLevel
  );

  const burstFinishRisk = mapBurstRisk(burstSusceptibility);
  const burstFinishAnalysis = generateBurstFinishAnalysis(
    burstSusceptibility,
    comboRole,
    bladeWeight,
    bit.type
  );

  // Gerar análise detalhada
  let strengths: string[] = [];
  let weaknesses: string[] = [];
  let recommendations: string[] = [];
  let bestAgainst: string[] = [];
  let weakAgainst: string[] = [];

  if (comboRole === "Attack") {
    strengths = [
      `Alto potencial de ataque (${totalAttack})`,
      "Bom para Over Finish",
      "Excelente contra combos de Stamina",
      `Ratchet com ${ratchetContactPoints} pontos de contato`,
    ];
    weaknesses = [
      `Resistência a burst: ${burstFinishRisk}`,
      `Defesa total: ${totalDefense}`,
      "Vulnerável a combos defensivos bem posicionados",
    ];
    recommendations = [
      "Lance com força máxima para maximizar o ataque",
      "Procure ataques diretos no início da batalha",
      "Use Xtreme Dash para ganhar vantagem",
    ];
    bestAgainst = ["Stamina", "Balance"];
    weakAgainst = ["Defense"];
  } else if (comboRole === "Defense") {
    strengths = [
      `Alta resistência (${totalDefense})`,
      `Resistência a burst: ${burstFinishRisk}`,
      "Excelente para manter posição no centro",
      "Bom contra ataques diretos",
    ];
    weaknesses = [
      `Ataque total: ${totalAttack}`,
      "Difícil de conseguir Over Finish",
      "Pode perder por Spin Finish contra Stamina",
    ];
    recommendations = [
      "Lance em ângulo defensivo para absorver ataques",
      "Mantenha-se no centro do estádio",
      "Espere o oponente gastar energia",
    ];
    bestAgainst = ["Attack"];
    weakAgainst = ["Stamina"];
  } else if (comboRole === "Stamina") {
    strengths = [
      `Excelente estamina (${totalStamina})`,
      "Potencial de Spin Finish",
      "Pode vencer por desgaste",
      `Resistência a burst: ${burstFinishRisk}`,
    ];
    weaknesses = [
      `Ataque total: ${totalAttack}`,
      `Defesa total: ${totalDefense}`,
      "Vulnerável a ataques diretos bem posicionados",
    ];
    recommendations = [
      "Lance com técnica consistente para manter rotação",
      "Evite ataques diretos posicionando-se estrategicamente",
      "Use movimento circular para desgastar oponente",
    ];
    bestAgainst = ["Attack"];
    weakAgainst = ["Defense"];
  } else {
    strengths = [
      `Score equilibrado (${overallScore})`,
      "Versátil contra múltiplos tipos",
      "Bom desempenho em cenários desconhecidos",
    ];
    weaknesses = [
      "Não se destaca em nenhuma área específica",
      "Pode ser superado por combos especializados",
    ];
    recommendations = [
      "Adapte a técnica de lançamento ao oponente",
      "Seja flexível na estratégia durante a batalha",
      "Observe o oponente antes de comprometer",
    ];
    bestAgainst = ["Desconhecido"];
    weakAgainst = ["Especializado"];
  }

  // Gerar sugestões
  const suggestions = generateSuggestions(blade, ratchet, bit, allParts, burstSusceptibility);

  // Dados para Radar Chart
  const radarData = [
    { label: "Ataque", value: totalAttack, max: 150 },
    { label: "Defesa", value: totalDefense, max: 150 },
    { label: "Estamina", value: totalStamina, max: 150 },
    { label: "Resistência Burst", value: (1 - burstSusceptibility) * 100, max: 100 },
    { label: "Estabilidade", value: ratchetContactPoints * 10, max: 100 },
  ];

  return {
    compatibility: "Compatible",
    overallScore,
    comboType: comboRole,
    totalAttack,
    totalDefense,
    totalStamina,
    burstSusceptibility,
    burstFinishRisk,
    burstFinishAnalysis,
    strengths,
    weaknesses,
    recommendations,
    bestAgainst,
    weakAgainst,
    suggestions,
    radarData,
  };
};
