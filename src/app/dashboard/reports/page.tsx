"use client";

import { useMemo } from "react";
import { useStore } from "@/context/StoreContext";
import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Users, CheckCircle, Clock, PieChart as PieIcon, TrendingUp } from "lucide-react";
import { format, startOfHour, parseISO } from "date-fns";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

export default function ReportsPage() {
  const { participants, categories } = useStore();

  const total = participants.length;
  const present = participants.filter(p => p.status === 'presente').length;
  const absent = total - present;
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;

  // Dados para o gráfico de pizza
  const pieData = [
    { name: 'Presentes', value: present, color: '#10b981' },
    { name: 'Ausentes', value: absent, color: '#e2e8f0' },
  ];

  // Dados para o gráfico de barras por categoria
  const categoryData = categories.map(cat => ({
    name: cat.name,
    total: participants.filter(p => p.categoryId === cat.id).length,
    presentes: participants.filter(p => p.categoryId === cat.id && p.status === 'presente').length,
  }));

  // Dados para a linha do tempo (Check-ins por hora)
  const timelineData = useMemo(() => {
    const hours: Record<string, number> = {};
    participants
      .filter(p => p.status === 'presente' && p.checkinTime)
      .forEach(p => {
        const hour = format(startOfHour(parseISO(p.checkinTime!)), 'HH:00');
        hours[hour] = (hours[hour] || 0) + 1;
      });
    
    return Object.entries(hours)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }, [participants]);

  const exportCSV = () => {
    const headers = ["Nome", "CPF", "Categoria", "Mesa", "Status", "Hora Check-in"];
    const rows = participants.map(p => {
      const category = categories.find(c => c.id === p.categoryId)?.name || '';
      const checkinTime = p.checkinTime ? format(new Date(p.checkinTime), 'dd/MM/yyyy HH:mm') : '';
      return [p.name, p.cpf, category, p.table, p.status, checkinTime].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_evento_${new Date().getTime()}.csv`);
    link.click();
  };

  return (
    <AdminGuard>
    <div className="space-y-6 md:space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Relatórios Analíticos</h1>
          <p className="text-sm md:text-base text-muted-foreground">Acompanhe o desempenho e fluxo do seu evento</p>
        </div>
        <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 w-full md:w-auto" onClick={exportCSV}>
          <Download className="w-5 h-5" />
          Exportar Dados
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardContent className="p-5 md:p-6 flex items-center gap-4">
            <div className="bg-blue-50 p-3 md:p-4 rounded-2xl shrink-0">
              <Users className="text-blue-600 w-6 h-6 md:w-7 h-7" />
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Inscritos</p>
              <p className="text-2xl md:text-3xl font-black text-slate-900">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardContent className="p-5 md:p-6 flex items-center gap-4">
            <div className="bg-emerald-50 p-3 md:p-4 rounded-2xl shrink-0">
              <CheckCircle className="text-emerald-600 w-6 h-6 md:w-7 h-7" />
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Presentes</p>
              <p className="text-2xl md:text-3xl font-black text-slate-900">{present}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardContent className="p-5 md:p-6 flex items-center gap-4">
            <div className="bg-slate-50 p-3 md:p-4 rounded-2xl shrink-0">
              <Clock className="text-slate-600 w-6 h-6 md:w-7 h-7" />
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Ausentes</p>
              <p className="text-2xl md:text-3xl font-black text-slate-900">{absent}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-3xl">
          <CardContent className="p-5 md:p-6 flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 md:p-4 rounded-2xl shrink-0">
              <TrendingUp className="w-6 h-6 md:w-7 h-7" />
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/70">Taxa de Presença</p>
              <p className="text-2xl md:text-3xl font-black">{percent}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-3xl">
          <CardHeader className="p-5 md:p-6">
            <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Fluxo de Entrada (Check-ins/Hora)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] p-5 md:p-6 pt-0 md:pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Check-ins" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-none shadow-sm bg-white rounded-3xl">
          <CardHeader className="p-5 md:p-6">
            <CardTitle className="text-base md:text-lg font-bold">Status de Presença</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] p-5 md:p-6 pt-0 md:pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm bg-white rounded-3xl">
          <CardHeader className="p-5 md:p-6">
            <CardTitle className="text-base md:text-lg font-bold">Presença por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] md:h-[350px] p-5 md:p-6 pt-0 md:pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} width={80} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="presentes" name="Presentes" fill="#10b981" radius={[0, 4, 4, 0]} barSize={15} />
                <Bar dataKey="total" name="Total Inscritos" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminGuard>
  );
}