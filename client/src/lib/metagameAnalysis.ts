import { Part } from "@/hooks/usePartsStorageV2";

export interface MetagameData {
  bladeRankings: {
    [key: string]: {
      name: string;
      tiers: {
        [tier: string]: string[];
      };
    };
  };
  ratchetRankings: {
    [tier: string]: Array<{
      name: string;
      contactPoints: number;
      height: number;
      heightLevel: number;
      type: string;
      description: string;
    }>;
  };
  bitRankings: {
    [tier: string]: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  };
  winningCombos: Array<{
    name: string;
    blade: string;
    ratchet: string;
    bit: string;
    tier: string;
    type: string;
    strengths: string[];
    weaknesses: string[];
    description: string;
  }>;
  metaAnalysis: {
    currentTrend: string;
    dominantTypes: string[];
    emergingTrend: string;
    deckFormats: {
      [format: string]: {
        winRate: string;
        description: string;
      };
    };
    keyInsights: string[];
  };
}

export interface MetagameRecommendation {
  bladeRank: string;
  bladeRanking: string;
  recommendedRatchets: string[];
  recommendedBits: string[];
  similarWinningCombos: string[];
  metagameInsight: string;
  competitiveViability: "S-Tier" | "A-Tier" | "B-Tier" | "C-Tier" | "D-Tier";
  deckFormat: string;
}

// Buscar tier de uma blade em um ranking específico
export const findBladeRank = (
  bladeName: string,
  metagameData: MetagameData,
  rankingKey: string
): { tier: string; ranking: string } | null => {
  const ranking = metagameData.bladeRankings[rankingKey];
  if (!ranking) return null;

  for (const [tier, blades] of Object.entries(ranking.tiers)) {
    if (blades.some((b) => b.toLowerCase() === bladeName.toLowerCase())) {
      return { tier, ranking: ranking.name };
    }
  }

  return null;
};

// Mapear tier para score numérico
const tierToScore = (tier: string): number => {
  const tierMap: { [key: string]: number } = {
    X: 100,
    "S+": 95,
    S: 90,
    A: 80,
    "A+": 85,
    B: 70,
    "B+": 75,
    C: 60,
    "C+": 65,
    D: 50,
    "D+": 55,
    F: 40,
    High: 65,
    Low: 45,
  };
  return tierMap[tier] || 50;
};

// Gerar recomendações baseado em metagame
export const generateMetagameRecommendation = (
  blade: Part,
  metagameData: MetagameData
): MetagameRecommendation => {
  // Encontrar tier da blade em múltiplos rankings
  const rank1 = findBladeRank(blade.name, metagameData, "ranking1");
  const rank2 = findBladeRank(blade.name, metagameData, "ranking2");
  const rank3 = findBladeRank(blade.name, metagameData, "ranking3");

  // Usar o ranking mais recente (ranking3)
  const primaryRank = rank3 || rank2 || rank1;
  const bladeRank = primaryRank?.tier || "Não Ranqueada";
  const bladeRanking = primaryRank?.ranking || "Desconhecida";

  // Determinar tipo de blade baseado no ranking
  let bladeType = "Balanced";
  if (blade.stats.attack > blade.stats.defense && blade.stats.attack > blade.stats.stamina) {
    bladeType = "Attack";
  } else if (blade.stats.defense > blade.stats.attack && blade.stats.defense > blade.stats.stamina) {
    bladeType = "Defense";
  } else if (blade.stats.stamina > blade.stats.attack && blade.stats.stamina > blade.stats.defense) {
    bladeType = "Stamina";
  }

  // Recomendar ratchets baseado no tipo
  let recommendedRatchets: string[] = [];
  let recommendedBits: string[] = [];

  if (bladeType === "Attack") {
    recommendedRatchets = ["3-60", "1-60", "3-80", "4-80"];
    recommendedBits = ["LR", "FB", "GF", "GP"];
  } else if (bladeType === "Defense") {
    recommendedRatchets = ["9-60", "7-60", "6-80", "3-80"];
    recommendedBits = ["O", "LO", "B", "H"];
  } else if (bladeType === "Stamina") {
    recommendedRatchets = ["9-60", "7-60", "5-60", "6-60"];
    recommendedBits = ["LR", "R", "O", "K"];
  } else {
    recommendedRatchets = ["9-60", "7-60", "5-60", "3-60"];
    recommendedBits = ["R", "GF", "O", "LR"];
  }

  // Encontrar combos vencedores similares
  const similarCombos = metagameData.winningCombos
    .filter((combo) => combo.blade.toLowerCase() === blade.name.toLowerCase())
    .map((combo) => combo.name);

  // Gerar insight de metagame
  let metagameInsight = "";
  const tierScore = tierToScore(bladeRank);

  if (tierScore >= 90) {
    metagameInsight = `${blade.name} é uma blade S-Tier no metagame atual. Altamente competitiva e versátil, funciona bem em múltiplos formatos de deck.`;
  } else if (tierScore >= 80) {
    metagameInsight = `${blade.name} é uma blade A-Tier. Muito viável competitivamente com o setup correto de ratchet e bit.`;
  } else if (tierScore >= 70) {
    metagameInsight = `${blade.name} é uma blade B-Tier. Viável em torneios com o combo certo, mas pode ter dificuldade contra S-Tier.`;
  } else if (tierScore >= 60) {
    metagameInsight = `${blade.name} é uma blade C-Tier. Funciona bem em jogo casual, mas menos viável em competição de alto nível.`;
  } else {
    metagameInsight = `${blade.name} está em tier mais baixo. Considere usar uma blade mais forte para competição.`;
  }

  // Determinar viabilidade competitiva
  let competitiveViability: "S-Tier" | "A-Tier" | "B-Tier" | "C-Tier" | "D-Tier" = "C-Tier";
  if (tierScore >= 90) competitiveViability = "S-Tier";
  else if (tierScore >= 80) competitiveViability = "A-Tier";
  else if (tierScore >= 70) competitiveViability = "B-Tier";
  else if (tierScore >= 60) competitiveViability = "C-Tier";
  else competitiveViability = "D-Tier";

  // Recomendar formato de deck
  let deckFormat = "2-Attack + 1-Stamina";
  if (bladeType === "Attack" && tierScore >= 85) {
    deckFormat = "3-Attack (Recomendado para meta agressivo)";
  } else if (bladeType === "Defense" || bladeType === "Stamina") {
    deckFormat = "2-Attack + 1-Stamina (Balanceado)";
  }

  return {
    bladeRank,
    bladeRanking,
    recommendedRatchets,
    recommendedBits,
    similarWinningCombos: similarCombos,
    metagameInsight,
    competitiveViability,
    deckFormat,
  };
};

// Comparar combo com winning combos conhecidos
export const compareWithWinningCombos = (
  blade: Part,
  ratchet: Part,
  bit: Part,
  metagameData: MetagameData
): {
  matchingCombos: typeof metagameData.winningCombos;
  similarity: number;
  recommendation: string;
} => {
  const matchingCombos = metagameData.winningCombos.filter(
    (combo) =>
      combo.blade.toLowerCase() === blade.name.toLowerCase() &&
      combo.ratchet === ratchet.name &&
      combo.bit === bit.name
  );

  if (matchingCombos.length > 0) {
    return {
      matchingCombos,
      similarity: 100,
      recommendation: `Excelente! Este é um combo vencedor conhecido: ${matchingCombos[0].name}. ${matchingCombos[0].description}`,
    };
  }

  // Verificar similaridade parcial
  const partialMatches = metagameData.winningCombos.filter(
    (combo) =>
      combo.blade.toLowerCase() === blade.name.toLowerCase() &&
      (combo.ratchet === ratchet.name || combo.bit === bit.name)
  );

  if (partialMatches.length > 0) {
    return {
      matchingCombos: partialMatches,
      similarity: 66,
      recommendation: `Combo similar a vencedores conhecidos. Considere usar ${partialMatches[0].ratchet} + ${partialMatches[0].bit} para máxima efetividade.`,
    };
  }

  return {
    matchingCombos: [],
    similarity: 0,
    recommendation: "Combo único. Teste em batalhas para validar sua efetividade no meta.",
  };
};

// Analisar viabilidade em meta atual
export const analyzeMetaViability = (
  blade: Part,
  ratchet: Part,
  bit: Part,
  metagameData: MetagameData
): {
  metaTier: string;
  viability: "Excelente" | "Muito Bom" | "Bom" | "Aceitável" | "Fraco";
  reasoning: string[];
  suggestions: string[];
} => {
  const reasoning: string[] = [];
  const suggestions: string[] = [];
  let viabilityScore = 0;

  // Analisar blade
  const bladeRank = findBladeRank(blade.name, metagameData, "ranking3");
  if (bladeRank) {
    viabilityScore += tierToScore(bladeRank.tier) / 100;
    reasoning.push(`Blade ${bladeRank.tier}-Tier: ${blade.name}`);
  } else {
    reasoning.push(`Blade não ranqueada: ${blade.name}`);
    viabilityScore += 0.5;
  }

  // Analisar ratchet
  const ratchetMatch = metagameData.ratchetRankings.S?.find((r) => r.name === ratchet.name) ||
    metagameData.ratchetRankings.A?.find((r) => r.name === ratchet.name) || null;

  if (ratchetMatch) {
    viabilityScore += 0.3;
    reasoning.push(`Ratchet meta: ${ratchet.name} (${ratchetMatch.contactPoints} pontos, ${ratchetMatch.height}mm)`);
  } else {
    reasoning.push(`Ratchet não-meta: ${ratchet.name}`);
    viabilityScore += 0.1;
  }

  // Analisar bit
  const bitMatch = metagameData.bitRankings.S?.find((b) => b.name === bit.name) ||
    metagameData.bitRankings.A?.find((b) => b.name === bit.name) || null;

  if (bitMatch) {
    viabilityScore += 0.3;
    reasoning.push(`Bit meta: ${bit.name} (${bitMatch.type})`);
  } else {
    reasoning.push(`Bit não-meta: ${bit.name}`);
    viabilityScore += 0.1;
  }

  // Determinar viabilidade
  let viability: "Excelente" | "Muito Bom" | "Bom" | "Aceitável" | "Fraco" = "Fraco";
  if (viabilityScore >= 0.9) viability = "Excelente";
  else if (viabilityScore >= 0.75) viability = "Muito Bom";
  else if (viabilityScore >= 0.6) viability = "Bom";
  else if (viabilityScore >= 0.4) viability = "Aceitável";

  // Gerar sugestões
  if (!ratchetMatch) {
    suggestions.push(`Considere usar um ratchet meta como 9-60, 7-60 ou 3-60`);
  }

  if (!bitMatch) {
    suggestions.push(`Considere usar um bit meta como LR, R, O ou GF`);
  }

  if (viability === "Fraco" || viability === "Aceitável") {
    suggestions.push(`Blade ${bladeRank?.tier || "desconhecida"} pode ter dificuldade contra S-Tier. Considere treinar bastante.`);
  }

  return {
    metaTier: bladeRank?.tier || "Desconhecido",
    viability,
    reasoning,
    suggestions,
  };
};
