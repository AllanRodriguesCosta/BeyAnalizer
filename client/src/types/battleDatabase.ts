/**
 * Tipos para o Sistema de Base de Dados Auto-Incrementável de Batalhas
 * Versão 2.0 - Beyblade X Combo Analyzer
 */

export interface BattleRecord {
  id: string;
  date: string;
  comboId: string;
  bladeName: string;
  ratchetName: string;
  bitName: string;
  beyType: "BX" | "UX" | "CX";
  result: "win" | "loss" | "draw";
  opponent?: {
    bladeName?: string;
    comboDescription?: string;
  };
  notes?: string;
  timestamp: number;
}

export interface TournamentEntry {
  id: string;
  tournamentName: string;
  date: string;
  location?: string;
  beys: Array<{
    bladeName: string;
    ratchetName: string;
    bitName: string;
    beyType: "BX" | "UX" | "CX";
  }>;
  results: Array<{
    beyCombo: string;
    wins: number;
    losses: number;
    draws: number;
  }>;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  placement?: number;
  notes?: string;
  timestamp: number;
}

export interface ComboStatistics {
  comboId: string;
  bladeName: string;
  ratchetName: string;
  bitName: string;
  beyType: "BX" | "UX" | "CX";
  totalBattles: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  lossRate: number;
  drawRate: number;
  lastUsed: string;
  firstUsed: string;
  favorability: "Excelente" | "Muito Bom" | "Bom" | "Aceitável" | "Fraco";
  trends: {
    recentWinRate: number;
    allTimeWinRate: number;
    trend: "Crescente" | "Estável" | "Decrescente";
  };
}

export interface MetagameDynamics {
  timestamp: number;
  date: string;
  topCombos: Array<{
    combo: string;
    winRate: number;
    usage: number;
  }>;
  topBlades: Array<{
    bladeName: string;
    winRate: number;
    usage: number;
  }>;
  topRatchets: Array<{
    ratchetName: string;
    winRate: number;
    usage: number;
  }>;
  topBits: Array<{
    bitName: string;
    winRate: number;
    usage: number;
  }>;
  metaTrend: string;
  dominantType: "Attack" | "Defense" | "Stamina" | "Balanced";
}

export interface BattleDatabase {
  battleRecords: BattleRecord[];
  tournamentEntries: TournamentEntry[];
  comboStatistics: ComboStatistics[];
  metagameDynamics: MetagameDynamics[];
  lastUpdated: string;
  version: string;
}

export interface ComboComparison {
  combo1: {
    bladeName: string;
    ratchetName: string;
    bitName: string;
    stats: {
      attack: number;
      defense: number;
      stamina: number;
    };
    winRate: number;
    totalBattles: number;
  };
  combo2: {
    bladeName: string;
    ratchetName: string;
    bitName: string;
    stats: {
      attack: number;
      defense: number;
      stamina: number;
    };
    winRate: number;
    totalBattles: number;
  };
  differences: {
    attackDiff: number;
    defenseDiff: number;
    staminaDiff: number;
    winRateDiff: number;
  };
  recommendation: string;
}

export interface AutomaticRecommendation {
  recommendedCombo: {
    bladeName: string;
    ratchetName: string;
    bitName: string;
  };
  reason: string;
  expectedWinRate: number;
  confidence: number;
  againstType: "Attack" | "Defense" | "Stamina" | "Balanced" | "Unknown";
  alternativeOptions: Array<{
    bladeName: string;
    ratchetName: string;
    bitName: string;
    expectedWinRate: number;
  }>;
  dataPoints: number;
}
