import { useState, useEffect, useCallback } from "react";
import {
  BattleRecord,
  TournamentEntry,
  ComboStatistics,
  MetagameDynamics,
  BattleDatabase,
  AutomaticRecommendation,
} from "@/types/battleDatabase";

const STORAGE_KEY = "beybladeX_battleDatabase";
const DEFAULT_DB: BattleDatabase = {
  battleRecords: [],
  tournamentEntries: [],
  comboStatistics: [],
  metagameDynamics: [],
  lastUpdated: new Date().toISOString(),
  version: "2.0",
};

export const useBattleDatabase = () => {
  const [database, setDatabase] = useState<BattleDatabase | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar banco de dados
  useEffect(() => {
    const loadDatabase = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setDatabase(JSON.parse(saved));
        } else {
          setDatabase(DEFAULT_DB);
        }
      } catch (error) {
        console.error("Erro ao carregar banco de dados:", error);
        setDatabase(DEFAULT_DB);
      } finally {
        setIsLoaded(true);
      }
    };

    loadDatabase();
  }, []);

  // Salvar banco de dados
  const saveDatabase = useCallback((db: BattleDatabase) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      setDatabase(db);
    } catch (error) {
      console.error("Erro ao salvar banco de dados:", error);
    }
  }, []);

  // Adicionar registro de batalha
  const addBattleRecord = useCallback(
    (record: Omit<BattleRecord, "id" | "timestamp">) => {
      if (!database) return;

      const newRecord: BattleRecord = {
        ...record,
        id: `battle-${Date.now()}`,
        timestamp: Date.now(),
      };

      const updatedDb = {
        ...database,
        battleRecords: [...database.battleRecords, newRecord],
        lastUpdated: new Date().toISOString(),
      };

      // Atualizar estatísticas de combo
      updateComboStatistics(updatedDb, newRecord);
      saveDatabase(updatedDb);

      return newRecord;
    },
    [database, saveDatabase]
  );

  // Adicionar entrada de torneio
  const addTournamentEntry = useCallback(
    (entry: Omit<TournamentEntry, "id" | "timestamp">) => {
      if (!database) return;

      const newEntry: TournamentEntry = {
        ...entry,
        id: `tournament-${Date.now()}`,
        timestamp: Date.now(),
      };

      const updatedDb = {
        ...database,
        tournamentEntries: [...database.tournamentEntries, newEntry],
        lastUpdated: new Date().toISOString(),
      };

      // Processar resultados do torneio
      processTournamentResults(updatedDb, newEntry);
      saveDatabase(updatedDb);

      return newEntry;
    },
    [database, saveDatabase]
  );

  // Atualizar estatísticas de combo
  const updateComboStatistics = (db: BattleDatabase, record: BattleRecord) => {
    const comboKey = `${record.bladeName}-${record.ratchetName}-${record.bitName}`;
    const existingStats = db.comboStatistics.find((s) => s.comboId === comboKey);

    if (existingStats) {
      existingStats.totalBattles += 1;
      if (record.result === "win") existingStats.wins += 1;
      else if (record.result === "loss") existingStats.losses += 1;
      else existingStats.draws += 1;

      existingStats.winRate = (existingStats.wins / existingStats.totalBattles) * 100;
      existingStats.lossRate = (existingStats.losses / existingStats.totalBattles) * 100;
      existingStats.drawRate = (existingStats.draws / existingStats.totalBattles) * 100;
      existingStats.lastUsed = record.date;

      // Atualizar favorabilidade
      if (existingStats.winRate >= 70) existingStats.favorability = "Excelente";
      else if (existingStats.winRate >= 60) existingStats.favorability = "Muito Bom";
      else if (existingStats.winRate >= 50) existingStats.favorability = "Bom";
      else if (existingStats.winRate >= 40) existingStats.favorability = "Aceitável";
      else existingStats.favorability = "Fraco";
    } else {
      const newStats: ComboStatistics = {
        comboId: comboKey,
        bladeName: record.bladeName,
        ratchetName: record.ratchetName,
        bitName: record.bitName,
        beyType: record.beyType,
        totalBattles: 1,
        wins: record.result === "win" ? 1 : 0,
        losses: record.result === "loss" ? 1 : 0,
        draws: record.result === "draw" ? 1 : 0,
        winRate: record.result === "win" ? 100 : record.result === "loss" ? 0 : 50,
        lossRate: record.result === "loss" ? 100 : record.result === "win" ? 0 : 50,
        drawRate: record.result === "draw" ? 100 : 0,
        lastUsed: record.date,
        firstUsed: record.date,
        favorability: record.result === "win" ? "Excelente" : "Fraco",
        trends: {
          recentWinRate: record.result === "win" ? 100 : 0,
          allTimeWinRate: record.result === "win" ? 100 : 0,
          trend: "Estável",
        },
      };

      db.comboStatistics.push(newStats);
    }
  };

  // Processar resultados de torneio
  const processTournamentResults = (db: BattleDatabase, tournament: TournamentEntry) => {
    for (const result of tournament.results) {
      const totalBattles = result.wins + result.losses + (result.draws || 0);
      const comboKey = result.beyCombo;

      const existingStats = db.comboStatistics.find((s) => s.comboId === comboKey);

      if (existingStats) {
        existingStats.totalBattles += totalBattles;
        existingStats.wins += result.wins;
        existingStats.losses += result.losses;
        existingStats.draws += result.draws || 0;
      } else {
        const newStats: ComboStatistics = {
          comboId: comboKey,
          bladeName: tournament.beys[0]?.bladeName || "Unknown",
          ratchetName: tournament.beys[0]?.ratchetName || "Unknown",
          bitName: tournament.beys[0]?.bitName || "Unknown",
          beyType: tournament.beys[0]?.beyType || "BX",
          totalBattles,
          wins: result.wins,
          losses: result.losses,
          draws: result.draws || 0,
          winRate: (result.wins / totalBattles) * 100,
          lossRate: (result.losses / totalBattles) * 100,
          drawRate: ((result.draws || 0) / totalBattles) * 100,
          lastUsed: tournament.date,
          firstUsed: tournament.date,
          favorability: "Bom",
          trends: {
            recentWinRate: (result.wins / totalBattles) * 100,
            allTimeWinRate: (result.wins / totalBattles) * 100,
            trend: "Estável",
          },
        };

        db.comboStatistics.push(newStats);
      }
    }

    // Atualizar dinâmica de metagame
    updateMetagameDynamics(db);
  };

  // Atualizar dinâmica de metagame
  const updateMetagameDynamics = (db: BattleDatabase) => {
    const topCombos = db.comboStatistics
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5)
      .map((s) => ({
        combo: `${s.bladeName} ${s.ratchetName} ${s.bitName}`,
        winRate: s.winRate,
        usage: s.totalBattles,
      }));

    const topBlades = db.comboStatistics
      .reduce(
        (acc, s) => {
          const existing = acc.find((b) => b.bladeName === s.bladeName);
          if (existing) {
            existing.totalWins += s.wins;
            existing.totalBattles += s.totalBattles;
          } else {
            acc.push({
              bladeName: s.bladeName,
              totalWins: s.wins,
              totalBattles: s.totalBattles,
            });
          }
          return acc;
        },
        [] as Array<{ bladeName: string; totalWins: number; totalBattles: number }>
      )
      .map((b) => ({
        bladeName: b.bladeName,
        winRate: (b.totalWins / b.totalBattles) * 100,
        usage: b.totalBattles,
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);

    const topRatchets = db.comboStatistics
      .reduce(
        (acc, s) => {
          const existing = acc.find((r) => r.ratchetName === s.ratchetName);
          if (existing) {
            existing.totalWins += s.wins;
            existing.totalBattles += s.totalBattles;
          } else {
            acc.push({
              ratchetName: s.ratchetName,
              totalWins: s.wins,
              totalBattles: s.totalBattles,
            });
          }
          return acc;
        },
        [] as Array<{ ratchetName: string; totalWins: number; totalBattles: number }>
      )
      .map((r) => ({
        ratchetName: r.ratchetName,
        winRate: (r.totalWins / r.totalBattles) * 100,
        usage: r.totalBattles,
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);

    const topBits = db.comboStatistics
      .reduce(
        (acc, s) => {
          const existing = acc.find((b) => b.bitName === s.bitName);
          if (existing) {
            existing.totalWins += s.wins;
            existing.totalBattles += s.totalBattles;
          } else {
            acc.push({
              bitName: s.bitName,
              totalWins: s.wins,
              totalBattles: s.totalBattles,
            });
          }
          return acc;
        },
        [] as Array<{ bitName: string; totalWins: number; totalBattles: number }>
      )
      .map((b) => ({
        bitName: b.bitName,
        winRate: (b.totalWins / b.totalBattles) * 100,
        usage: b.totalBattles,
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);

    const dominantType = topCombos[0]
      ? topCombos[0].combo.includes("Attack")
        ? "Attack"
        : topCombos[0].combo.includes("Defense")
          ? "Defense"
          : "Stamina"
      : "Balanced";

    const newDynamics: MetagameDynamics = {
      timestamp: Date.now(),
      date: new Date().toISOString(),
      topCombos,
      topBlades,
      topRatchets,
      topBits,
      metaTrend: `Top combo: ${topCombos[0]?.combo || "N/A"} com ${topCombos[0]?.winRate.toFixed(1)}% win rate`,
      dominantType,
    };

    db.metagameDynamics.push(newDynamics);
  };

  // Gerar recomendação automática
  const generateAutomaticRecommendation = useCallback(
    (againstType?: "Attack" | "Defense" | "Stamina" | "Balanced"): AutomaticRecommendation | null => {
      if (!database || database.comboStatistics.length === 0) {
        return null;
      }

      let relevantCombos = database.comboStatistics;

      if (againstType) {
        relevantCombos = relevantCombos.filter((s) => {
          // Lógica simples: combos defensivos contra ataque, etc
          if (againstType === "Attack") return s.favorability === "Excelente" || s.favorability === "Muito Bom";
          if (againstType === "Defense") return s.bladeName.includes("Dran") || s.bladeName.includes("Pegasus");
          if (againstType === "Stamina") return s.ratchetName.includes("9") || s.ratchetName.includes("7");
          return true;
        });
      }

      const topCombo = relevantCombos.sort((a, b) => b.winRate - a.winRate)[0];

      if (!topCombo) return null;

      const alternatives = relevantCombos
        .sort((a, b) => b.winRate - a.winRate)
        .slice(1, 4)
        .map((s) => ({
          bladeName: s.bladeName,
          ratchetName: s.ratchetName,
          bitName: s.bitName,
          expectedWinRate: s.winRate,
        }));

      return {
        recommendedCombo: {
          bladeName: topCombo.bladeName,
          ratchetName: topCombo.ratchetName,
          bitName: topCombo.bitName,
        },
        reason: `Baseado em ${topCombo.totalBattles} batalhas, este combo tem ${topCombo.winRate.toFixed(1)}% de taxa de vitória`,
        expectedWinRate: topCombo.winRate,
        confidence: Math.min(100, (topCombo.totalBattles / 50) * 100),
        againstType: againstType || "Unknown",
        alternativeOptions: alternatives,
        dataPoints: topCombo.totalBattles,
      };
    },
    [database]
  );

  // Obter estatísticas de combo
  const getComboStatistics = useCallback(
    (bladeName: string, ratchetName: string, bitName: string): ComboStatistics | null => {
      if (!database) return null;
      const comboKey = `${bladeName}-${ratchetName}-${bitName}`;
      return database.comboStatistics.find((s) => s.comboId === comboKey) || null;
    },
    [database]
  );

  // Exportar banco de dados
  const exportDatabase = useCallback(() => {
    if (!database) return;

    const dataStr = JSON.stringify(database, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `beyblade_battle_database_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [database]);

  // Importar banco de dados
  const importDatabase = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as BattleDatabase;
        saveDatabase(imported);
      } catch (error) {
        console.error("Erro ao importar banco de dados:", error);
      }
    };
    reader.readAsText(file);
  }, [saveDatabase]);

  return {
    database,
    isLoaded,
    addBattleRecord,
    addTournamentEntry,
    generateAutomaticRecommendation,
    getComboStatistics,
    exportDatabase,
    importDatabase,
  };
};
