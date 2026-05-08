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
import { format, parseISO, addMinutes } from "date-fns";
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

  // Função para tratar a data sem deslocamento de fuso horário
  const getFormattedDate = (dateString: string) => {
    if (!dateString) return 'Data pendente';
    // Adicionamos o deslocamento do fuso horário para garantir que a data permaneça no dia correto
    const date = parseISO(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return format(correctedDate, "dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Painel de <span className="text-primary">Controle</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Monitoramento em tempo real do <span className="font-bold text-slate-700">{eventSettings.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">
              {getFormattedDate(eventSettings.date)}
            </span>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-full font-bold animate-pulse">
            LIVE
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Inscritos', value: total, icon: Users, color: 'blue', sub: 'participantes' },
          { label: 'Presentes', value: present, icon: CheckCircle2, color: 'emerald', sub: `${total > 0 ? Math.round((present/total)*100) : 0}% de presença` },
          { label: 'Ausentes', value: total - present, icon: Clock, color: 'amber', sub: 'aguardando' },
          { label: 'Ocupação', value: `${Math.round(progress)}%`, icon: TrendingUp, color: 'slate', sub: 'capacidade total', dark: true },
        ].map((stat, i) => (
          <Card key={i} className={cn(
            "border-none shadow-xl shadow-slate-200/50 overflow-hidden group transition-all hover:scale-[1.02]",
            stat.dark ? "bg-slate-900 text-white" : "bg-white"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "p-2.5 rounded-xl",
                  stat.dark ? "bg-white/10" : `bg-${stat.color}-50`
                )}>
                  <stat.icon className={cn("w-5 h-5", stat.dark ? "text-white" : `text-${stat.color}-500`)} />
                </div>
                <div className="h-1 w-12 rounded-full bg-slate-100 group-hover:bg-primary/20 transition-colors" />
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
                <p className={cn("text-[10px] font-bold uppercase tracking-widest", stat.dark ? "text-slate-400" : "text-slate-400")}>
                  {stat.label}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50/10 flex items-center justify-between">
                <span className={cn("text-[11px] font-medium", stat.dark ? "text-slate-400" : "text-slate-500")}>{stat.sub}</span>
                {stat.dark && <Progress value={progress} className="h-1 w-16 bg-white/10" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Zap className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Ações Prioritárias</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/dashboard/checkin" className="group">
                <div className="p-6 rounded-[2rem] border-2 border-transparent bg-white shadow-lg shadow-slate-200/50 hover:border-primary/20 hover:shadow-primary/5 transition-all flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:rotate-3 transition-transform">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-slate-900">Check-in Rápido</h4>
                    <p className="text-sm text-slate-500">Validar entradas e QR Codes</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
              <Link href="/dashboard/tables" className="group">
                <div className="p-6 rounded-[2rem] border-2 border-transparent bg-white shadow-lg shadow-slate-200/50 hover:border-primary/20 hover:shadow-primary/5 transition-all flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center shrink-0 group-hover:rotate-3 transition-transform">
                    <Grid3x3 className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-slate-900">Mapa de Mesas</h4>
                    <p className="text-sm text-slate-500">Gestão de assentos e lotação</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </div>
          </div>

          {/* Event Info Card */}
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <Activity className="w-6 h-6 text-primary" />
                Configuração do Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Local do Evento</p>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-bold text-slate-900">{eventSettings.location || 'Não definido'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estrutura de Mesas</p>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100">
                    <Grid3x3 className="w-5 h-5 text-primary" />
                    <span className="font-bold text-slate-900">{eventSettings.totalTables} mesas • {eventSettings.capacityPerTable} lug.</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white h-full">
            <CardHeader className="p-8 pb-6 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black">Atividade</CardTitle>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-8">
                {recentCheckins.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <Activity className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-sm text-slate-400 font-bold">Nenhum check-in ainda</p>
                  </div>
                ) : (
                  recentCheckins.map((p, i) => (
                    <div key={p.id} className="flex gap-4 relative group">
                      {i !== recentCheckins.length - 1 && (
                        <div className="absolute left-[19px] top-10 bottom-[-32px] w-0.5 bg-slate-100 group-hover:bg-primary/10 transition-colors" />
                      )}
                      <div className="z-10 bg-emerald-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-black text-slate-900 truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] font-black px-1.5 py-0">
                            MESA {p.table}
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-400">
                            {format(new Date(p.checkinTime!), 'HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {recentCheckins.length > 0 && (
                <Button variant="outline" className="w-full mt-10 h-12 rounded-2xl font-bold text-slate-500 border-slate-100 hover:bg-slate-50 hover:text-primary transition-all" asChild>
                  <Link href="/dashboard/reports" className="flex items-center justify-center gap-2">
                    Ver Relatório Completo
                    <ArrowUpRight className="w-4 h-4" />
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