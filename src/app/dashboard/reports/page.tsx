"use client";

import { useStore } from "@/context/StoreContext";
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
    const headers = ["Nome", "Email", "CPF", "Categoria", "Mesa", "Status", "Hora Check-in"];
    const rows = participants.map(p => {
      const category = categories.find(c => c.id === p.categoryId)?.name || '';
      const checkinTime = p.checkinTime ? format(new Date(p.checkinTime), 'dd/MM/yyyy HH:mm') : '';
      return [p.name, p.email, p.cpf, category, p.table, p.status, checkinTime].join(',');
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
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Relatórios Analíticos</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho e fluxo do seu evento</p>
        </div>
        <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" onClick={exportCSV}>
          <Download className="w-5 h-5" />
          Exportar Dados
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl">
              <Users className="text-blue-600 w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inscritos</p>
              <p className="text-3xl font-black text-slate-900">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-emerald-50 p-4 rounded-2xl">
              <CheckCircle className="text-emerald-600 w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Presentes</p>
              <p className="text-3xl font-black text-slate-900">{present}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <Clock className="text-slate-600 w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ausentes</p>
              <p className="text-3xl font-black text-slate-900">{absent}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-3xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Taxa de Presença</p>
              <p className="text-3xl font-black">{percent}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Fluxo de Entrada (Check-ins/Hora)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Check-ins" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-none shadow-sm bg-white rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Status de Presença</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm bg-white rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Presença por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="presentes" name="Presentes" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="total" name="Total Inscritos" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useMemo } from "react";