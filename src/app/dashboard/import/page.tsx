"use client";

import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileWarning, CheckCircle, AlertTriangle, FileText, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function ImportPage() {
  const { importParticipants } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error("Por favor, selecione um arquivo CSV válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      if (lines.length < 2) {
        toast.error("O arquivo parece estar vazio ou sem dados.");
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header] = values[i];
        });
        return obj;
      });

      const res = await importParticipants(data);
      setResults(res);
      if (res.success > 0) {
        toast.success(`${res.success} participantes importados com sucesso!`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <AdminGuard>
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Importação de Dados</h1>
          <p className="text-muted-foreground">Cadastre centenas de participantes em segundos via CSV</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => {
          const csvContent = "nome,cpf,categoria,mesa\nJoão Silva,12345678901,VIP,5";
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'modelo_importacao.csv';
          a.click();
        }}>
          <FileText className="w-4 h-4" />
          Baixar Modelo CSV
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Regras do Arquivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900 text-slate-50 p-4 rounded-2xl font-mono text-[10px] leading-relaxed overflow-x-auto">
                nome, cpf, categoria, mesa<br/>
                João Silva, 12345678901, VIP, 5<br/>
                Maria Souza, 98765432100, Cliente, 12
              </div>
              <ul className="text-sm space-y-3 text-slate-500">
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>O cabeçalho deve conter exatamente: <strong>nome, cpf, categoria, mesa</strong>.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>O <strong>CPF</strong> deve ser único para cada participante.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>A <strong>Mesa</strong> deve respeitar o limite configurado no sistema.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div 
            className={cn(
              "border-4 border-dashed rounded-[2rem] p-16 text-center transition-all cursor-pointer group relative overflow-hidden",
              isDragging 
                ? "border-primary bg-primary/5 scale-[0.99]" 
                : "border-slate-100 bg-white hover:border-primary/30 hover:bg-slate-50/50"
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
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Upload className="text-primary w-10 h-10" />
            </div>
            <h3 className="font-black text-2xl text-slate-900">Arraste seu arquivo CSV</h3>
            <p className="text-slate-500 mt-2 text-lg">Ou clique para navegar nas suas pastas</p>
            <div className="mt-8 flex justify-center gap-4">
              <Badge variant="secondary" className="bg-slate-100 text-slate-500 px-4 py-1 rounded-full">UTF-8</Badge>
              <Badge variant="secondary" className="bg-slate-100 text-slate-500 px-4 py-1 rounded-full">Máx 5MB</Badge>
            </div>
          </div>

          {results && (
            <Card className={cn(
              "border-none shadow-xl rounded-3xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500",
              results.errors.length > 0 ? "bg-amber-50/50" : "bg-emerald-50/50"
            )}>
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500 text-white p-3 rounded-2xl">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Sucesso</p>
                      <p className="text-3xl font-black text-slate-900">{results.success} Importados</p>
                    </div>
                  </div>
                  
                  {results.errors.length > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-500 text-white p-3 rounded-2xl">
                        <AlertTriangle className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-600 uppercase tracking-widest">Erros</p>
                        <p className="text-3xl font-black text-slate-900">{results.errors.length} Falhas</p>
                      </div>
                    </div>
                  )}
                </div>

                {results.errors.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-amber-100 max-h-60 overflow-auto shadow-inner">
                    <p className="text-sm font-black text-amber-800 mb-4 flex items-center gap-2">
                      <FileWarning className="w-4 h-4" />
                      LOG DE ERROS DETALHADO:
                    </p>
                    <div className="space-y-2">
                      {results.errors.map((err, i) => (
                        <div key={i} className="text-sm text-amber-700 flex gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                          <span className="font-bold opacity-30">#{i+1}</span>
                          <span>{err}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full h-14 text-lg font-bold rounded-2xl border-2 hover:bg-white" 
                  onClick={() => setResults(null)}
                >
                  Fazer Nova Importação
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </AdminGuard>
  );
}