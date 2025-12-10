import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Lightbulb, TrendingUp } from "lucide-react";
import { AutomaticRecommendation } from "@/types/battleDatabase";

interface AutomaticRecommenderProps {
  recommendation: AutomaticRecommendation | null;
  isLoading: boolean;
  onSelectCombo: (bladeName: string, ratchetName: string, bitName: string) => void;
  againstType?: "Attack" | "Defense" | "Stamina" | "Balanced";
}

export default function AutomaticRecommender({
  recommendation,
  isLoading,
  onSelectCombo,
  againstType,
}: AutomaticRecommenderProps) {
  const [selectedAlternative, setSelectedAlternative] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-purple-500">
        <CardHeader>
          <CardTitle className="text-purple-300">Recomendador Automático</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendation) {
    return (
      <Card className="bg-slate-800 border-purple-500">
        <CardHeader>
          <CardTitle className="text-purple-300">Recomendador Automático</CardTitle>
          <CardDescription className="text-purple-200">
            Baseado em histórico de batalhas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-purple-300">
            <AlertCircle size={20} />
            <p>Registre batalhas para gerar recomendações personalizadas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const confidenceColor =
    recommendation.confidence >= 80
      ? "bg-green-900 text-green-200"
      : recommendation.confidence >= 60
        ? "bg-yellow-900 text-yellow-200"
        : "bg-orange-900 text-orange-200";

  const winRateColor =
    recommendation.expectedWinRate >= 70
      ? "text-green-400"
      : recommendation.expectedWinRate >= 50
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <Card className="bg-slate-800 border-purple-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-purple-300 flex items-center gap-2">
              <Lightbulb size={20} className="text-yellow-400" />
              Recomendador Automático
            </CardTitle>
            <CardDescription className="text-purple-200">
              {againstType && `Contra ${againstType} • `}
              Baseado em {recommendation.dataPoints} batalhas
            </CardDescription>
          </div>
          <Badge className={confidenceColor}>
            {recommendation.confidence.toFixed(0)}% confiança
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recomendação Principal */}
        <div className="bg-gradient-to-r from-purple-900 to-slate-700 rounded-lg p-4 border border-purple-500">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-purple-200 text-sm font-semibold">Combo Recomendado</p>
              <p className="text-white text-lg font-bold mt-1">
                {recommendation.recommendedCombo.bladeName}
              </p>
              <p className="text-purple-300 text-sm mt-1">
                {recommendation.recommendedCombo.ratchetName} • {recommendation.recommendedCombo.bitName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-purple-200 text-sm">Taxa de Vitória Esperada</p>
              <p className={`text-2xl font-bold ${winRateColor}`}>
                {recommendation.expectedWinRate.toFixed(1)}%
              </p>
            </div>
          </div>

          <p className="text-purple-200 text-sm mb-4">{recommendation.reason}</p>

          <Button
            onClick={() =>
              onSelectCombo(
                recommendation.recommendedCombo.bladeName,
                recommendation.recommendedCombo.ratchetName,
                recommendation.recommendedCombo.bitName
              )
            }
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Usar Este Combo
          </Button>
        </div>

        {/* Alternativas */}
        {recommendation.alternativeOptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-purple-300 font-semibold flex items-center gap-2">
              <TrendingUp size={16} />
              Alternativas Viáveis
            </p>

            <div className="space-y-2">
              {recommendation.alternativeOptions.map((alt, index) => (
                <div
                  key={index}
                  className={`bg-slate-700 border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedAlternative === index
                      ? "border-purple-500 bg-slate-600"
                      : "border-slate-600 hover:border-purple-400"
                  }`}
                  onClick={() => setSelectedAlternative(index)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{alt.bladeName}</p>
                      <p className="text-purple-300 text-sm">
                        {alt.ratchetName} • {alt.bitName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">
                        {alt.expectedWinRate.toFixed(1)}%
                      </p>
                      <p className="text-purple-300 text-xs">win rate</p>
                    </div>
                  </div>

                  {selectedAlternative === index && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCombo(alt.bladeName, alt.ratchetName, alt.bitName);
                      }}
                      className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                    >
                      Usar Este Combo
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
          <p className="text-purple-200 text-xs font-semibold mb-2">INFORMAÇÕES</p>
          <ul className="text-purple-300 text-xs space-y-1">
            <li>• Recomendação baseada em dados reais de batalhas</li>
            <li>• Confiança aumenta com mais dados registrados</li>
            <li>• Metagame é dinâmico - teste e registre seus resultados</li>
            <li>• Quanto mais batalhas, mais precisa a recomendação</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
