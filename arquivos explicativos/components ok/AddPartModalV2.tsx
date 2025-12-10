import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Info, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Part } from "@/hooks/usePartsStorageV2";

interface AddPartModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (part: Omit<Part, "id">) => { success: boolean; error?: string };
  validationError: string | null;
}

export default function AddPartModalV2({
  isOpen,
  onClose,
  onAdd,
  validationError,
}: AddPartModalV2Props) {
  const [partType, setPartType] = useState<"Blade" | "Ratchet" | "Bit" | "AssistBlade">("Blade");
  const [beyType, setBeyType] = useState<"BX" | "UX" | "CX">("BX");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [attack, setAttack] = useState("0");
  const [defense, setDefense] = useState("0");
  const [stamina, setStamina] = useState("0");
  const [dash, setDash] = useState("0");
  const [burst, setBurst] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const newPart: Omit<Part, "id"> = {
      name,
      type: partType,
      beyType,
      stats: {
        attack: parseInt(attack) || 0,
        defense: parseInt(defense) || 0,
        stamina: parseInt(stamina) || 0,
        ...(dash && { dash: parseInt(dash) }),
        ...(burst && { burst: parseInt(burst) }),
      },
      description: description || undefined,
    };

    const result = onAdd(newPart);
    if (result.success) {
      // Reset form
      setName("");
      setDescription("");
      setAttack("0");
      setDefense("0");
      setStamina("0");
      setDash("0");
      setBurst("0");
      setError(null);
      onClose();
    } else {
      setError(result.error || "Erro ao adicionar peça");
    }
  };

  const getNomenclatureHint = () => {
    switch (partType) {
      case "Blade":
        return "Apenas nomes com iniciais em maiúsculo (ex: Soar Phoenix)";
      case "Ratchet":
        return "Formato: número-número (ex: 9-60)";
      case "Bit":
        return "Apenas sigla (ex: B, LO, GF, DB)";
      case "AssistBlade":
        return "Apenas sigla (ex: S, A, F)";
    }
  };

  const shouldShowDashBurst = partType === "Bit";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-purple-500 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Adicionar Nova Peça</DialogTitle>
          <DialogDescription className="text-purple-200">
            Preencha os dados da peça para adicionar à sua coleção
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Display */}
          {(error || validationError) && (
            <div className="bg-red-900 border border-red-600 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-200 text-sm">{error || validationError}</p>
            </div>
          )}

          {/* Part Type Selection */}
          <div>
            <Label className="text-purple-300 mb-2 block">Tipo de Peça</Label>
            <Select value={partType} onValueChange={(value: any) => setPartType(value)}>
              <SelectTrigger className="bg-slate-700 border-purple-400 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-purple-400">
                <SelectItem value="Blade" className="text-white">
                  Blade (Lâmina)
                </SelectItem>
                <SelectItem value="Ratchet" className="text-white">
                  Ratchet (Eixo)
                </SelectItem>
                <SelectItem value="Bit" className="text-white">
                  Bit (Ponta)
                </SelectItem>
                <SelectItem value="AssistBlade" className="text-white">
                  Assist Blade (CX)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Beyblade Type Selection */}
          {partType !== "AssistBlade" && (
            <div>
              <Label className="text-purple-300 mb-2 block">Tipo de Beyblade</Label>
              <Select value={beyType} onValueChange={(value: any) => setBeyType(value)}>
                <SelectTrigger className="bg-slate-700 border-purple-400 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-purple-400">
                  <SelectItem value="BX" className="text-white">
                    BX
                  </SelectItem>
                  <SelectItem value="UX" className="text-white">
                    UX
                  </SelectItem>
                  <SelectItem value="CX" className="text-white">
                    CX
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Name Input with Tooltip */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-purple-300">Nome da Peça</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle size={16} className="text-purple-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-slate-700 border-purple-400 text-purple-200">
                  {getNomenclatureHint()}
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                partType === "Blade"
                  ? "ex: Soar Phoenix"
                  : partType === "Ratchet"
                    ? "ex: 9-60"
                    : "ex: B, LO, GF"
              }
              className="bg-slate-700 border-purple-400 text-white placeholder-purple-400"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-purple-300 mb-2 block">Descrição (Opcional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da peça..."
              className="bg-slate-700 border-purple-400 text-white placeholder-purple-400"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-purple-300 text-sm mb-1 block">Ataque</Label>
              <Input
                type="number"
                value={attack}
                onChange={(e) => setAttack(e.target.value)}
                min="0"
                max="100"
                className="bg-slate-700 border-purple-400 text-white"
              />
            </div>
            <div>
              <Label className="text-purple-300 text-sm mb-1 block">Defesa</Label>
              <Input
                type="number"
                value={defense}
                onChange={(e) => setDefense(e.target.value)}
                min="0"
                max="100"
                className="bg-slate-700 border-purple-400 text-white"
              />
            </div>
            <div>
              <Label className="text-purple-300 text-sm mb-1 block">Estamina</Label>
              <Input
                type="number"
                value={stamina}
                onChange={(e) => setStamina(e.target.value)}
                min="0"
                max="100"
                className="bg-slate-700 border-purple-400 text-white"
              />
            </div>

            {shouldShowDashBurst && (
              <>
                <div>
                  <Label className="text-purple-300 text-sm mb-1 block">Dash</Label>
                  <Input
                    type="number"
                    value={dash}
                    onChange={(e) => setDash(e.target.value)}
                    min="0"
                    max="100"
                    className="bg-slate-700 border-purple-400 text-white"
                  />
                </div>
                <div>
                  <Label className="text-purple-300 text-sm mb-1 block">Burst</Label>
                  <Input
                    type="number"
                    value={burst}
                    onChange={(e) => setBurst(e.target.value)}
                    min="0"
                    max="100"
                    className="bg-slate-700 border-purple-400 text-white"
                  />
                </div>
              </>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-slate-700 border border-purple-400 rounded-lg p-3 flex gap-2">
            <Info size={16} className="text-purple-300 flex-shrink-0 mt-0.5" />
            <p className="text-purple-200 text-sm">
              {partType === "Ratchet"
                ? "O sistema detectará automaticamente o nível de altura (1-5) baseado no valor inserido."
                : partType === "Bit"
                  ? "Dash e Burst são atributos exclusivos de Bits."
                  : "A peça será adicionada à sua biblioteca e disponível para análise."}
            </p>
          </div>

          {/* Buttons */}
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
              Adicionar Peça
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
