"use client";

import { useStore } from "@/context/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  Calendar as CalendarIcon,
  MapPin,
  Activity,
  Grid3x3,
  Zap,
  ArrowRight
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DashboardHome() {
  const { participants, eventSettings } = useStore();

  const total = participants.length;
  const present = participants.filter(p => p.status === 'presente').length;
  const progress = total > 0 ? (present / total) * 100 : 0;

  const recentCheckins = participants
    .filter(p => p.status === 'presente' && p.checkinTime)
    .sort((a, b) => new Date(b.checkinTime!).getTime() - new Date(a.checkinTime!).getTime())
    .slice(0, 5);

  const getFormattedDate = (dateString: string) => {
    if (!dateString) return 'Data pendente';
    const date = parseISO(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return format(correctedDate, "dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="space-y-0">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Painel de <span className="text-primary">Controle</span>
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">
            Monitoramento: <span className="font-bold text-slate-700">{eventSettings.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">
            <CalendarIcon className="w-3 h-3 text-primary" />
            <span className="font-bold text-[10px]">
              {getFormattedDate(eventSettings.date)}
            </span>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-1.5 py-0 rounded-full text-[9px] font-bold animate-pulse">
            LIVE
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Inscritos', value: total, icon: Users, color: 'blue', sub: 'total' },
          { label: 'Presentes', value: present, icon: CheckCircle2, color: 'emerald', sub: `${total > 0 ? Math.round((present/total)*100) : 0}%` },
          { label: 'Ausentes', value: total - present, icon: Clock, color: 'amber', sub: 'espera' },
          { label: 'Ocupação', value: `${Math.round(progress)}%`, icon: TrendingUp, color: 'indigo', sub: 'capacidade' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-md shadow-slate-200/30 overflow-hidden group transition-all hover:scale-[1.01] bg-white">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className={cn(
                  "p-1.5 rounded-md",
                  `bg-${stat.color}-50`
                )}>
                  <stat.icon className={cn("w-3.5 h-3.5", `text-${stat.color}-500`)} />
                </div>
                <div className="h-0.5 w-6 rounded-full bg-slate-100 group-hover:bg-primary/20 transition-colors" />
              </div>
              <div className="space-y-0">
                <h3 className="text-xl font-black tracking-tight text-slate-900">{stat.value}</h3>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                  {stat.label}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[9px] font-medium text-slate-500">{stat.sub}</span>
                {stat.label === 'Ocupação' && <Progress value={progress} className="h-0.5 w-8 bg-slate-100" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Actions */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <Zap className="w-3 h-3 text-primary" />
              <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ações</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link href="/dashboard/checkin" className="group">
                <div className="p-3 rounded-xl border border-transparent bg-white shadow-sm hover:border-primary/20 hover:shadow-md transition-all flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-sm group-hover:rotate-3 transition-transform">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-900">Check-in</h4>
                    <p className="text-[10px] text-slate-500">Validar entradas</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
              <Link href="/dashboard/tables" className="group">
                <div className="p-3 rounded-xl border border-transparent bg-white shadow-sm hover:border-primary/20 hover:shadow-md transition-all flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center shrink-0 group-hover:rotate-3 transition-transform">
                    <Grid3x3 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-900">Mesas</h4>
                    <p className="text-[10px] text-slate-500">Gestão de assentos</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </div>
          </div>

          {/* Event Info Card */}
          <Card className="border-none shadow-md shadow-slate-200/30 rounded-xl overflow-hidden bg-white">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-black flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                Configuração
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Local</p>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="font-bold text-[10px] text-slate-900 truncate">{eventSettings.location || 'Não definido'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Estrutura</p>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <Grid3x3 className="w-3.5 h-3.5 text-primary" />
                    <span className="font-bold text-[10px] text-slate-900">{eventSettings.totalTables} mesas • {eventSettings.capacityPerTable} lug.</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-4">
          <Card className="border-none shadow-md shadow-slate-200/30 rounded-xl bg-white h-full">
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black">Atividade</CardTitle>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-3">
                {recentCheckins.length === 0 ? (
                  <div className="py-6 text-center space-y-2">
                    <Activity className="w-4 h-4 text-slate-200 mx-auto" />
                    <p className="text-[9px] text-slate-400 font-bold">Sem check-ins</p>
                  </div>
                ) : (
                  recentCheckins.map((p, i) => (
                    <div key={p.id} className="flex gap-2 relative group">
                      {i !== recentCheckins.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-[-14px] w-0.5 bg-slate-50" />
                      )}
                      <div className="z-10 bg-emerald-500 text-white w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black text-slate-900 truncate">{p.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[7px] font-black px-1 py-0">
                            MESA {p.table}
                          </Badge>
                          <span className="text-[8px] font-bold text-slate-400">
                            {format(new Date(p.checkinTime!), 'HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {recentCheckins.length > 0 && (
                <Button variant="outline" className="w-full mt-4 h-8 rounded-lg text-[10px] font-bold text-slate-500 border-slate-100 hover:bg-slate-50 hover:text-primary transition-all" asChild>
                  <Link href="/dashboard/reports" className="flex items-center justify-center gap-1.5">
                    Relatório
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}