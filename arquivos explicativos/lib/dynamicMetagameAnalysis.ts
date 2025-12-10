import { ComboStatistics, MetagameDynamics, BattleDatabase } from "@/types/battleDatabase";

/**
 * Análise Dinâmica de Metagame
 * Versão 3.0 - Beyblade X Combo Analyzer
 * 
 * Este módulo analisa a evolução do metagame baseado em dados históricos
 * e fornece insights sobre tendências, matchups e estratégias viáveis.
 */

export interface MetagameTrend {
  direction: "Crescente" | "Estável" | "Decrescente";
  percentage: number;
  description: string;
}

export interface MatchupAnalysis {
  combo1: string;
  combo2: string;
  combo1WinRate: number;
  combo2WinRate: number;
  recommendation: string;
  confidence: number;
}

export interface MetagameInsight {
  trend: MetagameTrend;
  dominantArchetype: string;
  emergingArchetype: string;
  weakArchetype: string;
  recommendations: string[];
  matchupAnalysis: MatchupAnalysis[];
}

/**
 * Analisar tendência de um combo ao longo do tempo
 */
export const analyzeComboTrend = (
  combo: ComboStatistics,
  database: BattleDatabase
): MetagameTrend => {
  const recentBattles = database.battleRecords
    .filter((r) => r.comboId === combo.comboId)
    .slice(-10);

  if (recentBattles.length === 0) {
    return {
      direction: "Estável",
      percentage: 0,
      description: "Sem dados recentes",
    };
  }

  const recentWins = recentBattles.filter((r) => r.result === "win").length;
  const recentWinRate = (recentWins / recentBattles.length) * 100;
  const allTimeWinRate = combo.winRate;

  const difference = recentWinRate - allTimeWinRate;

  let direction: "Crescente" | "Estável" | "Decrescente" = "Estável";
  if (difference > 5) direction = "Crescente";
  else if (difference < -5) direction = "Decrescente";

  return {
    direction,
    percentage: Math.abs(difference),
    description:
      direction === "Crescente"
        ? `Win rate aumentou ${difference.toFixed(1)}% recentemente`
        : direction === "Decrescente"
          ? `Win rate diminuiu ${Math.abs(difference).toFixed(1)}% recentemente`
          : "Win rate estável",
  };
};

/**
 * Identificar arquétipos dominantes no metagame
 */
export const identifyDominantArchetype = (
  comboStats: ComboStatistics[]
): { archetype: string; winRate: number; usage: number } => {
  const archetypes: { [key: string]: { wins: number; total: number } } = {
    Attack: { wins: 0, total: 0 },
    Defense: { wins: 0, total: 0 },
    Stamina: { wins: 0, total: 0 },
    Balanced: { wins: 0, total: 0 },
  };

  for (const combo of comboStats) {
    let archetype = "Balanced";

    if (combo.bladeName.includes("Shark") || combo.bladeName.includes("Pegasus")) {
      archetype = "Attack";
    } else if (combo.bladeName.includes("Dragoon") || combo.bladeName.includes("Wyvern")) {
      archetype = "Defense";
    } else if (combo.ratchetName.includes("9") || combo.ratchetName.includes("7")) {
      archetype = "Stamina";
    }

    archetypes[archetype].wins += combo.wins;
    archetypes[archetype].total += combo.totalBattles;
  }

  let dominant = { archetype: "Balanced", winRate: 0, usage: 0 };

  for (const [arch, data] of Object.entries(archetypes)) {
    if (data.total > 0) {
      const winRate = (data.wins / data.total) * 100;
      if (winRate > dominant.winRate) {
        dominant = {
          archetype: arch,
          winRate,
          usage: data.total,
        };
      }
    }
  }

  return dominant;
};

/**
 * Analisar matchups entre combos
 */
export const analyzeMatchup = (
  combo1: ComboStatistics,
  combo2: ComboStatistics,
  database: BattleDatabase
): MatchupAnalysis => {
  // Encontrar batalhas diretas entre os dois combos
  const directBattles = database.battleRecords.filter(
    (r) =>
      (r.comboId === combo1.comboId && r.opponent?.comboDescription?.includes(combo2.bladeName)) ||
      (r.comboId === combo2.comboId && r.opponent?.comboDescription?.includes(combo1.bladeName))
  );

  let combo1Wins = 0;
  let combo2Wins = 0;

  for (const battle of directBattles) {
    if (battle.comboId === combo1.comboId && battle.result === "win") {
      combo1Wins++;
    } else if (battle.comboId === combo2.comboId && battle.result === "win") {
      combo2Wins++;
    }
  }

  const totalDirect = combo1Wins + combo2Wins;
  const combo1WinRate = totalDirect > 0 ? (combo1Wins / totalDirect) * 100 : 50;
  const combo2WinRate = totalDirect > 0 ? (combo2Wins / totalDirect) * 100 : 50;

  let recommendation = "";
  let confidence = Math.min(100, (totalDirect / 10) * 100);

  if (combo1WinRate > combo2WinRate + 10) {
    recommendation = `${combo1.bladeName} tem vantagem contra ${combo2.bladeName}`;
  } else if (combo2WinRate > combo1WinRate + 10) {
    recommendation = `${combo2.bladeName} tem vantagem contra ${combo1.bladeName}`;
  } else {
    recommendation = "Matchup equilibrado";
  }

  return {
    combo1: `${combo1.bladeName} ${combo1.ratchetName} ${combo1.bitName}`,
    combo2: `${combo2.bladeName} ${combo2.ratchetName} ${combo2.bitName}`,
    combo1WinRate,
    combo2WinRate,
    recommendation,
    confidence,
  };
};

/**
 * Gerar insights completos do metagame
 */
export const generateMetagameInsight = (database: BattleDatabase): MetagameInsight => {
  const comboStats = database.comboStatistics;

  if (comboStats.length === 0) {
    return {
      trend: {
        direction: "Estável",
        percentage: 0,
        description: "Sem dados suficientes",
      },
      dominantArchetype: "Desconhecido",
      emergingArchetype: "Desconhecido",
      weakArchetype: "Desconhecido",
      recommendations: ["Registre mais batalhas para análise de metagame"],
      matchupAnalysis: [],
    };
  }

  // Identificar arquétipos
  const dominant = identifyDominantArchetype(comboStats);
  const topCombos = comboStats.sort((a, b) => b.winRate - a.winRate);

  // Encontrar arquétipo emergente (segundo lugar)
  const archetypeStats: { [key: string]: { wins: number; total: number } } = {
    Attack: { wins: 0, total: 0 },
    Defense: { wins: 0, total: 0 },
    Stamina: { wins: 0, total: 0 },
    Balanced: { wins: 0, total: 0 },
  };

  for (const combo of comboStats) {
    let archetype = "Balanced";
    if (combo.bladeName.includes("Shark") || combo.bladeName.includes("Pegasus")) {
      archetype = "Attack";
    } else if (combo.bladeName.includes("Dragoon") || combo.bladeName.includes("Wyvern")) {
      archetype = "Defense";
    } else if (combo.ratchetName.includes("9") || combo.ratchetName.includes("7")) {
      archetype = "Stamina";
    }

    archetypeStats[archetype].wins += combo.wins;
    archetypeStats[archetype].total += combo.totalBattles;
  }

  let emergingArchetype = "Balanced";
  let emergingWinRate = 0;
  let weakArchetype = "Balanced";
  let weakWinRate = 100;

  for (const [arch, data] of Object.entries(archetypeStats)) {
    if (arch !== dominant.archetype && data.total > 0) {
      const winRate = (data.wins / data.total) * 100;
      if (winRate > emergingWinRate) {
        emergingArchetype = arch;
        emergingWinRate = winRate;
      }
      if (winRate < weakWinRate) {
        weakArchetype = arch;
        weakWinRate = winRate;
      }
    }
  }

  // Gerar recomendações
  const recommendations: string[] = [];

  if (dominant.archetype === "Attack") {
    recommendations.push("Meta agressivo: use combos defensivos para contra-atacar");
    recommendations.push("Ratchets altos (80mm) ganham importância");
  } else if (dominant.archetype === "Defense") {
    recommendations.push("Meta defensivo: combos de ataque puro têm dificuldade");
    recommendations.push("Foque em stamina para vencer por desgaste");
  } else if (dominant.archetype === "Stamina") {
    recommendations.push("Meta lento: combos rápidos podem surpreender");
    recommendations.push("Ataque agressivo nos primeiros segundos é crucial");
  }

  recommendations.push(
    `${emergingArchetype} está em ascensão - considere testar combos deste tipo`
  );

  // Analisar top matchups
  const matchupAnalysis: MatchupAnalysis[] = [];
  if (topCombos.length >= 2) {
    for (let i = 0; i < Math.min(3, topCombos.length - 1); i++) {
      const matchup = analyzeMatchup(topCombos[i], topCombos[i + 1], database);
      matchupAnalysis.push(matchup);
    }
  }

  // Calcular tendência geral
  const allRecentBattles = database.battleRecords.slice(-20);
  const recentWins = allRecentBattles.filter((r) => r.result === "win").length;
  const recentWinRate = (recentWins / allRecentBattles.length) * 100;
  const overallWinRate =
    (database.battleRecords.filter((r) => r.result === "win").length /
      database.battleRecords.length) *
    100;

  const trendDifference = recentWinRate - overallWinRate;
  let trendDirection: "Crescente" | "Estável" | "Decrescente" = "Estável";
  if (trendDifference > 5) trendDirection = "Crescente";
  else if (trendDifference < -5) trendDirection = "Decrescente";

  return {
    trend: {
      direction: trendDirection,
      percentage: Math.abs(trendDifference),
      description:
        trendDirection === "Crescente"
          ? `Seu desempenho está melhorando (${recentWinRate.toFixed(1)}% recentemente)`
          : trendDirection === "Decrescente"
            ? `Seu desempenho está piorando (${recentWinRate.toFixed(1)}% recentemente)`
            : `Seu desempenho está estável (${overallWinRate.toFixed(1)}% geral)`,
    },
    dominantArchetype: dominant.archetype,
    emergingArchetype: emergingArchetype,
    weakArchetype: weakArchetype,
    recommendations,
    matchupAnalysis,
  };
};

/**
 * Sugerir ajustes de combo baseado em metagame
 */
export const suggestComboAdjustments = (
  combo: ComboStatistics,
  database: BattleDatabase
): { suggestion: string; reason: string; alternatives: string[] } => {
  const insight = generateMetagameInsight(database);
  const alternatives: string[] = [];

  // Analisar performance do combo
  if (combo.winRate < 40) {
    return {
      suggestion: "Considere trocar este combo",
      reason: `Win rate baixo (${combo.winRate.toFixed(1)}%) contra meta atual`,
      alternatives: database.comboStatistics
        .filter((c) => c.winRate > 55)
        .slice(0, 3)
        .map((c) => `${c.bladeName} ${c.ratchetName} ${c.bitName}`),
    };
  }

  if (combo.winRate >= 70) {
    return {
      suggestion: "Combo excelente - mantenha usando",
      reason: `Win rate alto (${combo.winRate.toFixed(1)}%) contra meta atual`,
      alternatives: [],
    };
  }

  // Sugerir ajustes menores
  if (combo.ratchetName.includes("60") && insight.dominantArchetype === "Attack") {
    return {
      suggestion: "Considere aumentar altura do ratchet",
      reason: "Meta agressivo - ratchets mais altos (80mm) ganham importância",
      alternatives: ["Trocar para 7-80 ou 6-80", "Manter 9-60 para stamina"],
    };
  }

  if (combo.bitName === "GF" && insight.dominantArchetype === "Defense") {
    return {
      suggestion: "Considere trocar bit para defesa",
      reason: "Meta defensivo - bits defensivos (O, LO) são melhores",
      alternatives: ["Trocar para O ou LO", "Manter GF para ataque"],
    };
  }

  return {
    suggestion: "Combo balanceado",
    reason: `Performance adequada (${combo.winRate.toFixed(1)}%) contra meta atual`,
    alternatives: [],
  };
};
