import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import { ComboStatistics, MetagameDynamics } from "@/types/battleDatabase";

interface BattleStatisticsProps {
  comboStats: ComboStatistics[];
  metagameDynamics: MetagameDynamics | null;
}

export default function BattleStatistics({ comboStats, metagameDynamics }: BattleStatisticsProps) {
  const topCombos = comboStats
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5);

  const winLossData = comboStats.map((s) => ({
    name: `${s.bladeName.substring(0, 8)}...`,
    Vitórias: s.wins,
    Derrotas: s.losses,
    Empates: s.draws,
  }));

  const winRateData = comboStats
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 8)
    .map((s) => ({
      name: `${s.bladeName} ${s.ratchetName}`,
      "Win Rate": parseFloat(s.winRate.toFixed(1)),
    }));

  const totalStats = {
    totalBattles: comboStats.reduce((sum, s) => sum + s.totalBattles, 0),
    totalWins: comboStats.reduce((sum, s) => sum + s.wins, 0),
    totalLosses: comboStats.reduce((sum, s) => sum + s.losses, 0),
    totalDraws: comboStats.reduce((sum, s) => sum + s.draws, 0),
  };

  const overallWinRate =
    totalStats.totalBattles > 0
      ? ((totalStats.totalWins / totalStats.totalBattles) * 100).toFixed(1)
      : "0";

  const pieData = [
    { name: "Vitórias", value: totalStats.totalWins },
    { name: "Derrotas", value: totalStats.totalLosses },
    { name: "Empates", value: totalStats.totalDraws },
  ];

  const COLORS = ["#10b981", "#ef4444", "#f59e0b"];

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-300 text-sm font-semibold">Total de Batalhas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{totalStats.totalBattles}</p>
            <p className="text-purple-300 text-xs mt-1">registradas</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 text-sm font-semibold">Vitórias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{totalStats.totalWins}</p>
            <p className="text-purple-300 text-xs mt-1">{overallWinRate}% win rate</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 text-sm font-semibold">Derrotas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-400">{totalStats.totalLosses}</p>
            <p className="text-purple-300 text-xs mt-1">
              {totalStats.totalBattles > 0
                ? ((totalStats.totalLosses / totalStats.totalBattles) * 100).toFixed(1)
                : "0"}
              % loss rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-400 text-sm font-semibold">Empates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-400">{totalStats.totalDraws}</p>
            <p className="text-purple-300 text-xs mt-1">
              {totalStats.totalBattles > 0
                ? ((totalStats.totalDraws / totalStats.totalBattles) * 100).toFixed(1)
                : "0"}
              % draw rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza */}
        <Card className="bg-slate-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-purple-300">Distribuição de Resultados</CardTitle>
            <CardDescription className="text-purple-200">
              Total de {totalStats.totalBattles} batalhas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalStats.totalBattles > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-purple-300">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Win Rate */}
        <Card className="bg-slate-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-purple-300">Top 8 Combos por Win Rate</CardTitle>
            <CardDescription className="text-purple-200">
              Baseado em dados históricos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {winRateData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={winRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#999" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #a855f7" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="Win Rate" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-purple-300">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Combos */}
      <Card className="bg-slate-800 border-purple-500">
        <CardHeader>
          <CardTitle className="text-purple-300">Top 5 Combos</CardTitle>
          <CardDescription className="text-purple-200">
            Melhores combos por taxa de vitória
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topCombos.length > 0 ? (
            <div className="space-y-3">
              {topCombos.map((combo, index) => (
                <div
                  key={index}
                  className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-purple-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-purple-300 font-semibold">#{index + 1}</span>
                        <p className="text-white font-bold">{combo.bladeName}</p>
                        <Badge className="bg-purple-600 text-white text-xs">
                          {combo.ratchetName} • {combo.bitName}
                        </Badge>
                      </div>
                      <p className="text-purple-300 text-sm">
                        {combo.totalBattles} batalhas • {combo.wins}W-{combo.losses}L-{combo.draws}D
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 text-2xl font-bold">
                        {combo.winRate.toFixed(1)}%
                      </p>
                      <Badge
                        className={
                          combo.favorability === "Excelente"
                            ? "bg-green-900 text-green-200"
                            : combo.favorability === "Muito Bom"
                              ? "bg-blue-900 text-blue-200"
                              : combo.favorability === "Bom"
                                ? "bg-yellow-900 text-yellow-200"
                                : "bg-red-900 text-red-200"
                        }
                      >
                        {combo.favorability}
                      </Badge>
                    </div>
                  </div>

                  {combo.trends.trend === "Crescente" && (
                    <div className="flex items-center gap-1 text-green-400 text-xs mt-2">
                      <TrendingUp size={14} />
                      <span>Win rate em crescimento</span>
                    </div>
                  )}
                  {combo.trends.trend === "Decrescente" && (
                    <div className="flex items-center gap-1 text-red-400 text-xs mt-2">
                      <TrendingDown size={14} />
                      <span>Win rate em declínio</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-purple-300">
              <Zap size={32} className="mx-auto mb-2 opacity-50" />
              <p>Nenhum combo registrado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dinâmica de Metagame */}
      {metagameDynamics && (
        <Card className="bg-slate-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-purple-300">Dinâmica do Metagame</CardTitle>
            <CardDescription className="text-purple-200">
              Atualizado em {new Date(metagameDynamics.date).toLocaleDateString("pt-BR")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
              <p className="text-purple-300 text-sm font-semibold mb-2">Tendência Atual</p>
              <p className="text-white">{metagameDynamics.metaTrend}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                <p className="text-purple-300 text-xs font-semibold mb-2">Tipo Dominante</p>
                <p className="text-white font-bold">{metagameDynamics.dominantType}</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                <p className="text-purple-300 text-xs font-semibold mb-2">Top Blade</p>
                <p className="text-white font-bold">
                  {metagameDynamics.topBlades[0]?.bladeName || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
