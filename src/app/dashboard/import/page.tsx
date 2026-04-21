"use client";

import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, FileWarning, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function ImportPage() {
  const { importParticipants } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header] = values[i];
        });
        return obj;
      });

      const res = importParticipants(data);
      setResults(res);
      if (res.success > 0) {
        toast.success(`${res.success} participantes importados!`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Importação de Dados</h1>
        <p className="text-muted-foreground">Suba um arquivo CSV para cadastrar participantes em massa</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
            <CardDescription>O arquivo deve seguir o formato abaixo:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              nome, email, cpf, categoria, mesa<br/>
              João Silva, joao@email.com, 12345678901, VIP, 5<br/>
              Maria Souza, maria@email.com, 98765432100, Cliente, 12
            </div>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
              <li>O cabeçalho é obrigatório.</li>
              <li>CPF deve ser único.</li>
              <li>Mesa deve ser um número entre 1 e 20.</li>
              <li>Categorias novas serão criadas automaticamente.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div 
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer",
              isDragging ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) processFile(file);
            }}
            onClick={() => document.getElementById('csv-upload')?.click()}
          >
            <input 
              id="csv-upload" 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileUpload}
            />
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Upload className="text-primary w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg">Clique ou arraste o CSV</h3>
            <p className="text-sm text-muted-foreground mt-1">Apenas arquivos .csv são aceitos</p>
          </div>

          {results && (
            <Card className={cn(
              "border-l-4",
              results.errors.length > 0 ? "border-l-amber-500" : "border-l-green-500"
            )}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle className="text-green-500 w-5 h-5" />
                    <span>{results.success} Importados</span>
                  </div>
                  {results.errors.length > 0 && (
                    <div className="flex items-center gap-2 font-bold text-amber-600">
                      <AlertTriangle className="w-5 h-5" />
                      <span>{results.errors.length} Erros</span>
                    </div>
                  )}
                </div>

                {results.errors.length > 0 && (
                  <div className="bg-amber-50 p-3 rounded border border-amber-100 max-h-40 overflow-auto">
                    <p className="text-xs font-bold text-amber-800 mb-2">Log de Erros:</p>
                    {results.errors.map((err, i) => (
                      <p key={i} className="text-xs text-amber-700 mb-1">• {err}</p>
                    ))}
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={() => setResults(null)}>
                  Limpar Resultados
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}