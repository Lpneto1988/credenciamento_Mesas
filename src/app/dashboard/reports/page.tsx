"use client";

import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, Users, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ReportsPage() {
  const { participants, categories } = useStore();

  const total = participants.length;
  const present = participants.filter(p => p.status === 'presente').length;
  const absent = total - present;
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;

  const exportCSV = () => {
    const headers = ["Nome", "Email", "CPF", "Categoria", "Mesa", "Status", "Hora Check-in", "Operador"];
    const rows = participants.map(p => {
      const category = categories.find(c => c.id === p.categoryId)?.name || '';
      const checkinTime = p.checkinTime ? format(new Date(p.checkinTime), 'dd/MM/yyyy HH:mm') : '';
      return [
        p.name,
        p.email,
        p.cpf,
        category,
        p.table,
        p.status,
        checkinTime,
        p.operatorId || ''
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_evento_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">Acompanhe o status de presença em tempo real</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Inscritos</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="text-green-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Presentes</p>
              <p className="text-2xl font-bold">{present}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-xl">
              <Clock className="text-slate-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ausentes</p>
              <p className="text-2xl font-bold">{absent}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-80">Taxa de Presença</p>
              <p className="text-2xl font-bold">{percent}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exportar Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Gere um arquivo CSV completo com todos os dados dos participantes, incluindo horários de entrada e operadores responsáveis.
          </p>
          <Button size="lg" className="gap-2" onClick={exportCSV}>
            <Download className="w-5 h-5" />
            Baixar Relatório Completo (CSV)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}