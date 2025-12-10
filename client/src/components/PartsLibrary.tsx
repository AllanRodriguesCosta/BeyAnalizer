import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { Part } from "@/hooks/usePartsStorageV2";

interface PartsLibraryProps {
  parts: Part[];
  onAddClick: () => void;
  onDelete: (partId: string, partType: string) => void;
}

export default function PartsLibrary({ parts, onAddClick, onDelete }: PartsLibraryProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const partsByType = {
    Blade: parts.filter((p) => p.type === "Blade"),
    Ratchet: parts.filter((p) => p.type === "Ratchet"),
    Bit: parts.filter((p) => p.type === "Bit"),
    AssistBlade: parts.filter((p) => p.type === "AssistBlade"),
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Blade: "Lâminas",
      Ratchet: "Eixos",
      Bit: "Pontas",
      AssistBlade: "Assist Blades (CX)",
    };
    return labels[type] || type;
  };

  const getBeyTypeColor = (beyType: string) => {
    switch (beyType) {
      case "BX":
        return "bg-blue-600";
      case "UX":
        return "bg-cyan-600";
      case "CX":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const PartCard = ({ part }: { part: Part }) => (
    <div className="bg-slate-700 border border-purple-400 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-white font-semibold">{part.name}</h4>
          {part.description && (
            <p className="text-sm text-purple-300 mt-1">{part.description}</p>
          )}
        </div>
        <Badge className={`${getBeyTypeColor(part.beyType)} text-white ml-2`}>
          {part.beyType}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="bg-slate-600 rounded p-2">
          <span className="text-red-400 font-semibold">{part.stats.attack}</span>
          <p className="text-xs text-purple-300">Ataque</p>
        </div>
        <div className="bg-slate-600 rounded p-2">
          <span className="text-blue-400 font-semibold">{part.stats.defense}</span>
          <p className="text-xs text-purple-300">Defesa</p>
        </div>
        <div className="bg-slate-600 rounded p-2">
          <span className="text-green-400 font-semibold">{part.stats.stamina}</span>
          <p className="text-xs text-purple-300">Estamina</p>
        </div>
      </div>

      {(part.stats.dash || part.stats.burst) && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          {part.stats.dash !== undefined && (
            <div className="bg-slate-600 rounded p-2">
              <span className="text-yellow-400 font-semibold">{part.stats.dash}</span>
              <p className="text-xs text-purple-300">Dash</p>
            </div>
          )}
          {part.stats.burst !== undefined && (
            <div className="bg-slate-600 rounded p-2">
              <span className="text-orange-400 font-semibold">{part.stats.burst}</span>
              <p className="text-xs text-purple-300">Burst</p>
            </div>
          )}
        </div>
      )}

      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(part.id, part.type)}
        className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
      >
        <Trash2 size={16} />
        Deletar
      </Button>
    </div>
  );

  return (
    <Card className="bg-slate-800 border-purple-500 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Biblioteca de Peças</CardTitle>
            <CardDescription className="text-purple-200">
              Total: {parts.length} peça(s) adicionada(s)
            </CardDescription>
          </div>
          <Button
            onClick={onAddClick}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Plus size={18} />
            Adicionar Peça
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {parts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-purple-300 mb-4">Nenhuma peça adicionada ainda.</p>
            <Button
              onClick={onAddClick}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Adicionar Primeira Peça
            </Button>
          </div>
        ) : (
          Object.entries(partsByType).map(([type, typeParts]) => (
            <div key={type}>
              <button
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === type ? null : type
                  )
                }
                className="w-full text-left mb-4"
              >
                <h3 className="text-lg font-semibold text-purple-300 hover:text-purple-200 transition-colors">
                  {getTypeLabel(type)} ({typeParts.length})
                </h3>
              </button>

              {expandedCategory === type && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {typeParts.map((part) => (
                    <PartCard key={part.id} part={part} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
