import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload } from "lucide-react";

interface DataManagerProps {
  onExport: () => string | null;
  onImport: (data: string) => boolean;
}

export default function DataManager({ onExport, onImport }: DataManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = onExport();
    if (!data) {
      alert("Nenhum dado para exportar");
      return;
    }

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(data)
    );
    element.setAttribute("download", "beyblade_parts.json");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = onImport(content);
        if (success) {
          alert("Dados importados com sucesso!");
        } else {
          alert("Erro ao importar dados. Verifique o formato do arquivo.");
        }
      } catch (error) {
        alert("Erro ao ler o arquivo");
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="bg-slate-800 border-blue-500 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-blue-400">Gerenciar Dados</CardTitle>
        <CardDescription className="text-purple-200">
          Exporte ou importe seus dados de peças
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-wrap">
          <Button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Download size={18} />
            Exportar JSON
          </Button>

          <Button
            onClick={handleImportClick}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Upload size={18} />
            Importar JSON
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
        <p className="text-sm text-purple-300 mt-4">
          💡 Dica: Exporte seus dados regularmente para fazer backup. Você pode importar
          em qualquer momento para restaurar ou sincronizar dados entre dispositivos.
        </p>
      </CardContent>
    </Card>
  );
}
