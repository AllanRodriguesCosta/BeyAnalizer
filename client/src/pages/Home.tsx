import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Info, Zap, Plus } from "lucide-react";
import { usePartsStorageV2 } from "@/hooks/usePartsStorageV2";
import AddPartModalV2 from "@/components/AddPartModalV2";
import DataManager from "@/components/DataManager";
import PartsLibrary from "@/components/PartsLibrary";

interface ComboAnalysis {
  compatibility: "Compatible" | "Incompatible";
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  bestAgainst: string[];
  weakAgainst: string[];
}

export default function Home() {
  const [comboType, setComboType] = useState<"CX" | "BX">("BX");
  const [selectedBlade, setSelectedBlade] = useState<string>("");
  const [selectedRatchet, setSelectedRatchet] = useState<string>("");
  const [selectedBit, setSelectedBit] = useState<string>("");
  const [selectedAssistBlade, setSelectedAssistBlade] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [partsData, setPartsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"analyzer" | "library">("analyzer");

  const { storageData, isLoaded, addPart, deletePart, exportData, importData } =
    usePartsStorageV2();

  // Load default parts data
  useEffect(() => {
    fetch("/beyblade_parts_db.json")
      .then((res) => res.json())
      .then((data) => setPartsData(data))
      .catch((err) => console.error("Failed to load parts data:", err));
  }, []);

  // Combine default and custom parts
  const allBlades = useMemo(() => {
    const defaultBlades = partsData?.blades || [];
    const customBlades = storageData?.blades || [];
    return [...defaultBlades, ...customBlades];
  }, [partsData, storageData]);

  const allRatchets = useMemo(() => {
    const defaultRatchets = partsData?.ratchets || [];
    const customRatchets = storageData?.ratchets || [];
    return [...defaultRatchets, ...customRatchets];
  }, [partsData, storageData]);

  const allBits = useMemo(() => {
    const defaultBits = partsData?.bits || [];
    const customBits = storageData?.bits || [];
    return [...defaultBits, ...customBits];
  }, [partsData, storageData]);

  // Filter blades based on combo type
  const availableBlades = useMemo(() => {
    if (!partsData && !storageData) return [];
    const cxExcluded = ["Courage", "Reaper", "Arc Wizard", "Dark", "Wolf Hunt", "Pegasus Blast"];
    return allBlades.filter((blade: any) => {
      if (comboType === "BX") {
        return !cxExcluded.some((cx) => blade.name.includes(cx));
      }
      return blade.type === "CX" || blade.beyType === "CX";
    });
  }, [comboType, allBlades, partsData, storageData]);

  const selectedBladeData = allBlades.find((b: any) => b.name === selectedBlade);
  const selectedRatchetData = allRatchets.find((r: any) => r.name === selectedRatchet);
  const selectedBitData = allBits.find((b: any) => b.name === selectedBit);

  // Analyze combo
  const analysis = useMemo<ComboAnalysis | null>(() => {
    if (!selectedBladeData || !selectedRatchetData || !selectedBitData) {
      return null;
    }

    // Check compatibility
    const isCompatible = comboType === "BX" || selectedBladeData.type === "CX" || selectedBladeData.beyType === "CX";

    if (!isCompatible) {
      return {
        compatibility: "Incompatible",
        overallScore: 0,
        strengths: [],
        weaknesses: ["Incompatibilidade de tipo: Lâmina BX não pode ser usada em combo CX"],
        recommendations: ["Selecione uma lâmina CX para este combo"],
        bestAgainst: [],
        weakAgainst: [],
      };
    }

    // Calculate overall score (0-100)
    const bladeAttack = selectedBladeData.stats.attack;
    const bladeDefense = selectedBladeData.stats.defense;
    const bladeStamina = selectedBladeData.stats.stamina;

    const ratchetAttack = selectedRatchetData.stats.attack;
    const ratchetDefense = selectedRatchetData.stats.defense;
    const ratchetStamina = selectedRatchetData.stats.stamina;

    const bitAttack = selectedBitData.stats.attack;
    const bitDefense = selectedBitData.stats.defense;
    const bitStamina = selectedBitData.stats.stamina;

    const totalAttack = bladeAttack + ratchetAttack + bitAttack;
    const totalDefense = bladeDefense + ratchetDefense + bitDefense;
    const totalStamina = bladeStamina + ratchetStamina + bitStamina;

    const overallScore = Math.round((totalAttack + totalDefense + totalStamina) / 3);

    // Determine combo type (Attack, Defense, Stamina, Balance)
    const maxStat = Math.max(totalAttack, totalDefense, totalStamina);
    let comboRole = "Equilibrado";
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let recommendations: string[] = [];
    let bestAgainst: string[] = [];
    let weakAgainst: string[] = [];

    if (totalAttack === maxStat && totalAttack > 100) {
      comboRole = "Ataque";
      strengths = [
        "Alto potencial de ataque e Over Finish",
        "Bom para Xtreme Dash e combos agressivos",
        `Ataque Total: ${totalAttack}`,
      ];
      weaknesses = [
        "Baixa resistência a Burst",
        "Vulnerável a combos defensivos",
        `Defesa Total: ${totalDefense}`,
      ];
      recommendations = [
        "Lance com força máxima para maximizar o ataque",
        "Procure posicionar o Beyblade para ataques diretos",
        "Use contra combos de Estamina para Over Finish",
      ];
      bestAgainst = ["Estamina", "Equilíbrio"];
      weakAgainst = ["Defesa"];
    } else if (totalDefense === maxStat && totalDefense > 100) {
      comboRole = "Defesa";
      strengths = [
        "Alta resistência a Burst e ataques",
        "Excelente para manter posição no centro",
        `Defesa Total: ${totalDefense}`,
      ];
      weaknesses = [
        "Baixo potencial de ataque",
        "Difícil de conseguir Over Finish",
        `Ataque Total: ${totalAttack}`,
      ];
      recommendations = [
        "Lance em ângulo defensivo para absorver ataques",
        "Mantenha-se no centro do estádio",
        "Espere o oponente gastar energia",
      ];
      bestAgainst = ["Ataque"];
      weakAgainst = ["Estamina"];
    } else if (totalStamina === maxStat && totalStamina > 100) {
      comboRole = "Estamina";
      strengths = [
        "Excelente Spin Finish",
        "Pode vencer por desgaste",
        `Estamina Total: ${totalStamina}`,
      ];
      weaknesses = [
        "Vulnerável a ataques diretos",
        "Pode ser nocauteado se não tiver defesa",
        `Defesa Total: ${totalDefense}`,
      ];
      recommendations = [
        "Lance com técnica consistente para manter rotação",
        "Evite ataques diretos posicionando-se estrategicamente",
        "Use contra combos de ataque para Spin Finish",
      ];
      bestAgainst = ["Ataque"];
      weakAgainst = ["Defesa"];
    } else {
      comboRole = "Equilíbrio";
      strengths = [
        "Versátil e adaptável",
        "Bom desempenho em múltiplos cenários",
        `Score Equilibrado: ${overallScore}`,
      ];
      weaknesses = [
        "Não se destaca em nenhuma área específica",
        "Pode ser superado por combos especializados",
      ];
      recommendations = [
        "Adapte a técnica de lançamento ao oponente",
        "Seja flexível na estratégia durante a batalha",
        "Use contra combos desconhecidos",
      ];
      bestAgainst = ["Desconhecido"];
      weakAgainst = ["Especializado"];
    }

    return {
      compatibility: "Compatible",
      overallScore,
      strengths,
      weaknesses,
      recommendations,
      bestAgainst,
      weakAgainst,
    };
  }, [selectedBladeData, selectedRatchetData, selectedBitData, comboType]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const allCustomParts = [
    ...(storageData?.blades || []),
    ...(storageData?.ratchets || []),
    ...(storageData?.bits || []),
    ...(storageData?.assistBlades || []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Beyblade X Combo Analyzer
          </h1>
          <p className="text-xl text-purple-200 drop-shadow-md">
            Analise suas combinações de peças e descubra o melhor combo para sua estratégia
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 justify-center">
          <Button
            onClick={() => setActiveTab("analyzer")}
            className={`${
              activeTab === "analyzer"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-slate-700 hover:bg-slate-600"
            } text-white`}
          >
            Analisador de Combos
          </Button>
          <Button
            onClick={() => setActiveTab("library")}
            className={`${
              activeTab === "library"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-slate-700 hover:bg-slate-600"
            } text-white`}
          >
            Biblioteca de Peças
          </Button>
        </div>

        {/* Analyzer Tab */}
        {activeTab === "analyzer" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Selection Panel */}
            <Card className="lg:col-span-1 bg-slate-800 border-purple-500 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Configurar Combo</CardTitle>
                <CardDescription className="text-purple-200">
                  {isLoaded ? "Selecione suas peças" : "Carregando peças..."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Combo Type Selection */}
                <div>
                  <label className="text-sm font-semibold text-purple-300 mb-2 block">
                    Tipo de Combo
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={comboType === "BX" ? "default" : "outline"}
                      onClick={() => {
                        setComboType("BX");
                        setSelectedAssistBlade("");
                      }}
                      className={comboType === "BX" ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      BX
                    </Button>
                    <Button
                      variant={comboType === "CX" ? "default" : "outline"}
                      onClick={() => {
                        setComboType("CX");
                      }}
                      className={comboType === "CX" ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      CX
                    </Button>
                  </div>
                </div>

                {/* Blade Selection */}
                <div>
                  <label className="text-sm font-semibold text-purple-300 mb-2 block">
                    Blade (Lâmina)
                  </label>
                  <Select value={selectedBlade} onValueChange={setSelectedBlade}>
                    <SelectTrigger className="bg-slate-700 border-purple-400 text-white">
                      <SelectValue placeholder="Selecione uma Blade" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-purple-400">
                      {availableBlades.map((blade: any) => (
                        <SelectItem key={blade.name} value={blade.name} className="text-white">
                          {blade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assist Blade Selection (CX only) */}
                {comboType === "CX" && (
                  <div>
                    <label className="text-sm font-semibold text-purple-300 mb-2 block">
                      Assist Blade (CX)
                    </label>
                    <Select value={selectedAssistBlade} onValueChange={setSelectedAssistBlade}>
                      <SelectTrigger className="bg-slate-700 border-purple-400 text-white">
                        <SelectValue placeholder="Selecione uma Assist Blade" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-purple-400">
                        {partsData?.cx_parts.assist_blades && partsData.cx_parts.assist_blades.map((ab: any) => (
                          <SelectItem key={ab.name} value={ab.name} className="text-white">
                            {ab.name}
                          </SelectItem>
                        ))}
                        {storageData?.assistBlades && storageData.assistBlades.map((ab: any) => (
                          <SelectItem key={ab.id} value={ab.name} className="text-white">
                            {ab.name} (Custom)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Ratchet Selection */}
                <div>
                  <label className="text-sm font-semibold text-purple-300 mb-2 block">
                    Ratchet (Eixo)
                  </label>
                  <Select value={selectedRatchet} onValueChange={setSelectedRatchet}>
                    <SelectTrigger className="bg-slate-700 border-purple-400 text-white">
                      <SelectValue placeholder="Selecione um Ratchet" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-purple-400">
                      {allRatchets.map((ratchet: any) => (
                        <SelectItem key={ratchet.name || ratchet.id} value={ratchet.name} className="text-white">
                          {ratchet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bit Selection */}
                <div>
                  <label className="text-sm font-semibold text-purple-300 mb-2 block">
                    Bit (Ponta)
                  </label>
                  <Select value={selectedBit} onValueChange={setSelectedBit}>
                    <SelectTrigger className="bg-slate-700 border-purple-400 text-white">
                      <SelectValue placeholder="Selecione um Bit" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-purple-400">
                      {allBits.map((bit: any) => (
                        <SelectItem key={bit.name || bit.id} value={bit.name} className="text-white">
                          {bit.name} ({bit.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Panel */}
            <div className="lg:col-span-2 space-y-6">
              {!analysis ? (
                <Card className="bg-slate-800 border-purple-500 shadow-2xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center text-purple-300 text-center">
                      <Info className="mr-2" />
                      <p>Selecione todas as peças para análise</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Compatibility & Score */}
                  <Card className="bg-slate-800 border-purple-500 shadow-2xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">Análise do Combo</CardTitle>
                        {analysis.compatibility === "Compatible" ? (
                          <CheckCircle className="text-green-500" size={24} />
                        ) : (
                          <AlertCircle className="text-red-500" size={24} />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300">Compatibilidade:</span>
                        <Badge
                          variant={analysis.compatibility === "Compatible" ? "default" : "destructive"}
                          className={
                            analysis.compatibility === "Compatible"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }
                        >
                          {analysis.compatibility}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300">Score Geral:</span>
                        <span className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {analysis.overallScore}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-slate-800 border-green-500 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="text-green-400 flex items-center">
                          <Zap className="mr-2" size={20} />
                          Forças
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.strengths.map((strength, idx) => (
                            <li key={idx} className="text-green-200 text-sm flex items-start">
                              <span className="mr-2">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-red-500 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="text-red-400 flex items-center">
                          <AlertCircle className="mr-2" size={20} />
                          Fraquezas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.weaknesses.map((weakness, idx) => (
                            <li key={idx} className="text-red-200 text-sm flex items-start">
                              <span className="mr-2">•</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recommendations */}
                  <Card className="bg-slate-800 border-blue-500 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-blue-400">Recomendações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-blue-200 text-sm flex items-start">
                            <span className="mr-2">→</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Matchups */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-slate-800 border-yellow-500 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="text-yellow-400">Bom Contra</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysis.bestAgainst.map((type, idx) => (
                            <Badge key={idx} className="bg-yellow-600 text-yellow-100">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-orange-500 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="text-orange-400">Fraco Contra</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysis.weakAgainst.map((type, idx) => (
                            <Badge key={idx} className="bg-orange-600 text-orange-100">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === "library" && isLoaded && (
          <div className="space-y-8">
            <PartsLibrary
              parts={allCustomParts}
              onAddClick={() => setIsAddModalOpen(true)}
              onDelete={(partId, partType) => deletePart(partId, partType)}
            />
            <DataManager
              onExport={exportData}
              onImport={importData}
            />
          </div>
        )}

        {/* Info Section */}
        <Card className="mt-12 bg-slate-800 border-purple-500 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Sobre o Analyzer</CardTitle>
          </CardHeader>
          <CardContent className="text-purple-200 space-y-4">
            <p>
              Esta ferramenta analisa combinações de Beyblade X baseado em dados de atributos de peças e lógica de metagame.
            </p>
            <p>
              <strong>Compatibilidade:</strong> Combos CX usam Lock Chip, Blade CX, Assist Blade e peças universais (Ratchet e Bit). Combos BX usam Blade BX com peças universais.
            </p>
            <p>
              <strong>Score:</strong> Calculado pela soma dos atributos de Ataque, Defesa e Estamina de todas as peças.
            </p>
            <p>
              <strong>Análise:</strong> Baseada no tipo de combo (Ataque, Defesa, Estamina, Equilíbrio) e recomendações de estratégia.
            </p>
            <p>
              <strong>Peças Customizadas:</strong> Você pode adicionar suas próprias peças usando a aba "Biblioteca de Peças". Os dados são salvos localmente no seu navegador.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Part Modal */}
      <AddPartModalV2
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addPart}
      />
    </div>
  );
}
