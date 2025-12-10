import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Part } from "@/hooks/usePartsStorageV2";
import { TournamentEntry } from "@/types/battleDatabase";

interface ComboComparatorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTournament: (tournament: Omit<TournamentEntry, "id" | "timestamp">) => void;
  allParts: { blades: Part[]; ratchets: Part[]; bits: Part[] };
}

export default function ComboComparator({
  isOpen,
  onClose,
  onAddTournament,
  allParts,
}: ComboComparatorProps) {
  const [tournamentName, setTournamentName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [beys, setBeys] = useState<Array<{ blade: string; ratchet: string; bit: string }>>([
    { blade: "", ratchet: "", bit: "" },
    { blade: "", ratchet: "", bit: "" },
    { blade: "", ratchet: "", bit: "" },
  ]);
  const [results, setResults] = useState<Array<{ beyIndex: number; wins: number; losses: number; draws: number }>>([
    { beyIndex: 0, wins: 0, losses: 0, draws: 0 },
    { beyIndex: 1, wins: 0, losses: 0, draws: 0 },
    { beyIndex: 2, wins: 0, losses: 0, draws: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);

  const handleAddBey = () => {
    if (beys.length < 5) {
      setBeys([...beys, { blade: "", ratchet: "", bit: "" }]);
      setResults([...results, { beyIndex: beys.length, wins: 0, losses: 0, draws: 0 }]);
    }
  };

  const handleRemoveBey = (index: number) => {
    if (beys.length > 3) {
      setBeys(beys.filter((_, i) => i !== index));
      setResults(results.filter((r) => r.beyIndex !== index));
    }
  };

  const handleUpdateBey = (index: number, field: "blade" | "ratchet" | "bit", value: string) => {
    const updated = [...beys];
    updated[index] = { ...updated[index], [field]: value };
    setBeys(updated);
  };

  const handleUpdateResult = (index: number, field: "wins" | "losses" | "draws", value: number) => {
    const updated = [...results];
    updated[index] = { ...updated[index], [field]: value };
    setResults(updated);
  };

  const handleSubmit = () => {
    if (!tournamentName.trim()) {
      setError("Nome do torneio é obrigatório");
      return;
    }

    if (beys.some((b) => !b.blade || !b.ratchet || !b.bit)) {
      setError("Todas as peças devem ser preenchidas");
      return;
    }

    const tournamentResults = results.map((r) => {
      const bey = beys[r.beyIndex];
      return {
        beyCombo: `${bey.blade}-${bey.ratchet}-${bey.bit}`,
        wins: r.wins,
        losses: r.losses,
        draws: r.draws,
      };
    });

    const totalWins = results.reduce((sum, r) => sum + r.wins, 0);
    const totalLosses = results.reduce((sum, r) => sum + r.losses, 0);
    const totalDraws = results.reduce((sum, r) => sum + r.draws, 0);

    const tournament: Omit<TournamentEntry, "id" | "timestamp"> = {
      tournamentName,
      date,
      location: location || undefined,
      beys: beys.map((b) => ({
        bladeName: b.blade,
        ratchetName: b.ratchet,
        bitName: b.bit,
        beyType: "BX",
      })),
      results: tournamentResults,
      totalWins,
      totalLosses,
      totalDraws,
      notes: undefined,
    };

    onAddTournament(tournament);
    setError(null);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTournamentName("");
    setLocation("");
    setDate(new Date().toISOString().split("T")[0]);
    setBeys([
      { blade: "", ratchet: "", bit: "" },
      { blade: "", ratchet: "", bit: "" },
      { blade: "", ratchet: "", bit: "" },
    ]);
    setResults([
      { beyIndex: 0, wins: 0, losses: 0, draws: 0 },
      { beyIndex: 1, wins: 0, losses: 0, draws: 0 },
      { beyIndex: 2, wins: 0, losses: 0, draws: 0 },
    ]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-purple-500 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Registrar Torneio</DialogTitle>
          <DialogDescription className="text-purple-200">
            Registre seus 3 Beyblades de torneio e os resultados de cada uma
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger value="info" className="text-white">
              Informações
            </TabsTrigger>
            <TabsTrigger value="results" className="text-white">
              Resultados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            {error && (
              <div className="bg-red-900 border border-red-600 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-purple-300">Nome do Torneio</Label>
              <Input
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="ex: Campeonato Regional 2025"
                className="bg-slate-700 border-purple-400 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-purple-300">Data</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-slate-700 border-purple-400 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-purple-300">Local (Opcional)</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ex: São Paulo, SP"
                  className="bg-slate-700 border-purple-400 text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-purple-300">Beyblades do Torneio</Label>
                {beys.length < 5 && (
                  <Button
                    size="sm"
                    onClick={handleAddBey}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus size={16} className="mr-1" /> Adicionar
                  </Button>
                )}
              </div>

              {beys.map((bey, index) => (
                <Card key={index} className="bg-slate-700 border-purple-400">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-300 font-semibold">Beyblade {index + 1}</span>
                      {beys.length > 3 && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveBey(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-purple-300 text-xs">Blade</Label>
                        <select
                          value={bey.blade}
                          onChange={(e) => handleUpdateBey(index, "blade", e.target.value)}
                          className="w-full bg-slate-600 border border-purple-400 text-white rounded px-2 py-1 text-sm"
                        >
                          <option value="">Selecione</option>
                          {allParts.blades.map((b) => (
                            <option key={b.id} value={b.name}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-purple-300 text-xs">Ratchet</Label>
                        <select
                          value={bey.ratchet}
                          onChange={(e) => handleUpdateBey(index, "ratchet", e.target.value)}
                          className="w-full bg-slate-600 border border-purple-400 text-white rounded px-2 py-1 text-sm"
                        >
                          <option value="">Selecione</option>
                          {allParts.ratchets.map((r) => (
                            <option key={r.id} value={r.name}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-purple-300 text-xs">Bit</Label>
                        <select
                          value={bey.bit}
                          onChange={(e) => handleUpdateBey(index, "bit", e.target.value)}
                          className="w-full bg-slate-600 border border-purple-400 text-white rounded px-2 py-1 text-sm"
                        >
                          <option value="">Selecione</option>
                          {allParts.bits.map((b) => (
                            <option key={b.id} value={b.name}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="text-purple-200 text-sm">
              Registre os resultados de cada Beyblade no torneio
            </div>

            {results.map((result, index) => (
              <Card key={index} className="bg-slate-700 border-purple-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-300 text-base">
                    {beys[result.beyIndex]?.blade || `Beyblade ${result.beyIndex + 1}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-purple-300 text-sm">Vitórias</Label>
                      <Input
                        type="number"
                        min="0"
                        value={result.wins}
                        onChange={(e) => handleUpdateResult(index, "wins", parseInt(e.target.value) || 0)}
                        className="bg-slate-600 border-purple-400 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-300 text-sm">Derrotas</Label>
                      <Input
                        type="number"
                        min="0"
                        value={result.losses}
                        onChange={(e) => handleUpdateResult(index, "losses", parseInt(e.target.value) || 0)}
                        className="bg-slate-600 border-purple-400 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-300 text-sm">Empates</Label>
                      <Input
                        type="number"
                        min="0"
                        value={result.draws}
                        onChange={(e) => handleUpdateResult(index, "draws", parseInt(e.target.value) || 0)}
                        className="bg-slate-600 border-purple-400 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 border-purple-400 text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Registrar Torneio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
