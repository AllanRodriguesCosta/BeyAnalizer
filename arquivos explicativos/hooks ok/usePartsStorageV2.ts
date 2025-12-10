import { useState, useEffect, useCallback } from "react";

export interface RatchetData {
  name: string;
  height: number;
  heightLevel: number;
  contactPoints: number;
}

export interface BitData {
  name: string;
  type: string;
  dash?: number;
  burst?: number;
}

export interface Part {
  id: string;
  name: string;
  type: "Blade" | "Ratchet" | "Bit" | "AssistBlade";
  beyType: "BX" | "UX" | "CX";
  stats: {
    attack: number;
    defense: number;
    stamina: number;
    dash?: number;
    burst?: number;
  };
  description?: string;
  imageUrl?: string;
  ratchetData?: RatchetData;
  bitData?: BitData;
}

export interface StorageData {
  blades: Part[];
  ratchets: Part[];
  bits: Part[];
  assistBlades: Part[];
  lastUpdated: string;
}

// Validação de nomenclatura
const validateNomenclature = (name: string, type: string): { valid: boolean; error?: string } => {
  if (!name || name.trim() === "") {
    return { valid: false, error: "Nome não pode estar vazio" };
  }

  switch (type) {
    case "Blade":
      // Blade: Apenas nomes com iniciais em maiúsculo
      if (!/^[A-Z][a-z]+ [A-Z][a-z]+/.test(name)) {
        return {
          valid: false,
          error: "Blade deve ter formato: 'Nome Sobrenome' (ex: Soar Phoenix)",
        };
      }
      break;

    case "Ratchet":
      // Ratchet: "número-número" (ex: 9-60)
      if (!/^\d+-\d+$/.test(name)) {
        return {
          valid: false,
          error: "Ratchet deve ter formato: 'número-número' (ex: 9-60)",
        };
      }
      break;

    case "Bit":
      // Bit: Apenas siglas (ex: B, LO, GF)
      if (!/^[A-Z]{1,3}$/.test(name)) {
        return {
          valid: false,
          error: "Bit deve ser apenas sigla (ex: B, LO, GF, DB)",
        };
      }
      break;

    case "AssistBlade":
      // Assist Blade: Apenas sigla (ex: S, A, F)
      if (!/^[A-Z]{1,3}$/.test(name)) {
        return {
          valid: false,
          error: "Assist Blade deve ser apenas sigla (ex: S, A, F)",
        };
      }
      break;
  }

  return { valid: true };
};

// Detectar duplicidade
const checkDuplicate = (
  name: string,
  type: string,
  existingParts: Part[]
): { isDuplicate: boolean; duplicatePart?: Part } => {
  const duplicate = existingParts.find(
    (p) => p.name.toLowerCase() === name.toLowerCase() && p.type === type
  );

  return {
    isDuplicate: !!duplicate,
    duplicatePart: duplicate,
  };
};

// Extrair nível de altura do ratchet
const extractRatchetData = (name: string): RatchetData | null => {
  const match = name.match(/^(\d+)-(\d+)$/);
  if (!match) return null;

  const contactPoints = parseInt(match[1]);
  const height = parseInt(match[2]);

  let heightLevel: number;
  if (height >= 50 && height <= 55) heightLevel = 1;
  else if (height >= 60 && height <= 65) heightLevel = 2;
  else if (height >= 70 && height <= 75) heightLevel = 3;
  else if (height >= 80 && height <= 85) heightLevel = 4;
  else heightLevel = 5;

  return { name, height, heightLevel, contactPoints };
};

export const usePartsStorageV2 = () => {
  const [storageData, setStorageData] = useState<StorageData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Carregar dados do localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Primeiro, tentar carregar do arquivo JSON (se disponível)
        const response = await fetch("/beyblade_parts_db.json");
        if (response.ok) {
          const defaultData = await response.json();
          
          // Depois, tentar carregar dados customizados do localStorage
          const savedData = localStorage.getItem("beybladeCustomParts");
          
          if (savedData) {
            const customData = JSON.parse(savedData) as StorageData;
            setStorageData({
              blades: [...(defaultData.blades || []), ...customData.blades],
              ratchets: [...(defaultData.ratchets || []), ...customData.ratchets],
              bits: [...(defaultData.bits || []), ...customData.bits],
              assistBlades: [...(defaultData.assistBlades || []), ...customData.assistBlades],
              lastUpdated: customData.lastUpdated ?? new Date().toISOString(),
            });
          } else {
            setStorageData({
              blades: defaultData.blades || [],
              ratchets: defaultData.ratchets || [],
              bits: defaultData.bits || [],
              assistBlades: defaultData.assistBlades || [],
              lastUpdated: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Se falhar, tentar apenas localStorage
        const savedData = localStorage.getItem("beybladeCustomParts");
        if (savedData) {
          setStorageData(JSON.parse(savedData));
        }
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Adicionar peça com validação
  const addPart = useCallback(
    (part: Omit<Part, "id">) => {
      if (!storageData) return { success: false, error: "Dados não carregados" };

      // Validar nomenclatura
      const nomenclatureCheck = validateNomenclature(part.name, part.type);
      if (!nomenclatureCheck.valid) {
        setValidationError(nomenclatureCheck.error ?? "Erro desconhecido");
        return { success: false, error: nomenclatureCheck.error ?? "Erro desconhecido" };
      }

      // Verificar duplicidade
      const partsArray = storageData[part.type.toLowerCase() + "s" as keyof StorageData] as Part[];
      const duplicateCheck = checkDuplicate(part.name, part.type, partsArray);

      if (duplicateCheck.isDuplicate) {
        const error = `Peça "${part.name}" já existe na base de dados`;
        setValidationError(error);
        return { success: false, error };
      }

      // Se for ratchet, extrair dados de altura
      let newPart = { ...part };
      if (part.type === "Ratchet") {
        const ratchetData = extractRatchetData(part.name);
        if (ratchetData) {
          newPart = { ...newPart, ratchetData };
        }
      }

      // Criar ID único
      const id = `${part.type}-${part.name}-${Date.now()}`;
      const partWithId = { ...newPart, id };

      // Atualizar estado
      const updatedData: StorageData = {
        ...storageData,
        [part.type.toLowerCase() + "s"]: [
          ...(storageData[part.type.toLowerCase() + "s" as keyof StorageData] as Part[]),
          partWithId,
        ],
        lastUpdated: new Date().toISOString(),
      };

      setStorageData(updatedData);

      // Salvar no localStorage
      const customParts = {
        blades: updatedData.blades.filter((p) => p.id.startsWith("Blade-")),
        ratchets: updatedData.ratchets.filter((p) => p.id.startsWith("Ratchet-")),
        bits: updatedData.bits.filter((p) => p.id.startsWith("Bit-")),
        assistBlades: updatedData.assistBlades.filter((p) => p.id.startsWith("AssistBlade-")),
        lastUpdated: updatedData.lastUpdated,
      };

      localStorage.setItem("beybladeCustomParts", JSON.stringify(customParts));
      setValidationError(null);

      return { success: true, partId: id };
    },
    [storageData]
  );

  // Deletar peça
  const deletePart = useCallback(
    (partId: string, partType: string) => {
      if (!storageData) return;

      const typeKey = partType.toLowerCase() + "s" as keyof StorageData;
      const updatedParts = (storageData[typeKey] as Part[]).filter((p) => p.id !== partId);

      const updatedData: StorageData = {
        ...storageData,
        [typeKey]: updatedParts,
        lastUpdated: new Date().toISOString(),
      };

      setStorageData(updatedData);

      // Atualizar localStorage
      const customParts = {
        blades: updatedData.blades.filter((p) => p.id.startsWith("Blade-")),
        ratchets: updatedData.ratchets.filter((p) => p.id.startsWith("Ratchet-")),
        bits: updatedData.bits.filter((p) => p.id.startsWith("Bit-")),
        assistBlades: updatedData.assistBlades.filter((p) => p.id.startsWith("AssistBlade-")),
        lastUpdated: updatedData.lastUpdated,
      };

      localStorage.setItem("beybladeCustomParts", JSON.stringify(customParts));
    },
    [storageData]
  );

  // Exportar dados como JSON
  const exportData = useCallback(() => {
    if (!storageData) return;

    const customParts = {
      blades: storageData.blades.filter((p) => p.id.startsWith("Blade-")),
      ratchets: storageData.ratchets.filter((p) => p.id.startsWith("Ratchet-")),
      bits: storageData.bits.filter((p) => p.id.startsWith("Bit-")),
      assistBlades: storageData.assistBlades.filter((p) => p.id.startsWith("AssistBlade-")),
      lastUpdated: storageData.lastUpdated,
    };

    const dataStr = JSON.stringify(customParts, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `beyblade_parts_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [storageData]);

  // Importar dados de JSON
  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as StorageData;
        
        if (!storageData) return;

        const updatedData: StorageData = {
          ...storageData,
          blades: [...storageData.blades, ...imported.blades],
          ratchets: [...storageData.ratchets, ...imported.ratchets],
          bits: [...storageData.bits, ...imported.bits],
          assistBlades: [...storageData.assistBlades, ...imported.assistBlades],
          lastUpdated: new Date().toISOString(),
        };

        setStorageData(updatedData);
        localStorage.setItem("beybladeCustomParts", JSON.stringify(imported));
        setValidationError(null);
      } catch (error) {
        setValidationError("Erro ao importar arquivo JSON");
      }
    };
    reader.readAsText(file);
  }, [storageData]);

  return {
    storageData,
    isLoaded,
    addPart,
    deletePart,
    exportData,
    importData,
    validationError,
    clearValidationError: () => setValidationError(null),
  };
};
