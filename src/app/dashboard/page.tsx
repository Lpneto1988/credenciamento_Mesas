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
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardHome() {
  const { participants, eventSettings } = useStore();

  const total = participants.length;
  const present = participants.filter(p => p.status === 'presente').length;
  const progress = total > 0 ? (present / total) * 100 : 0;

  const recentCheckins = participants
    .filter(p => p.status === 'presente' && p.checkinTime)
    .sort((a, b) => new Date(b.checkinTime!).getTime() - new Date(a.checkinTime!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-sm text-slate-500">Acompanhe o status do evento em tempo real.</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <span className="font-medium">
              {eventSettings.date ? format(new Date(eventSettings.date), "dd 'de' MMMM, yyyy", { locale: ptBR }) : 'Data não definida'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inscritos</p>
              <Users className="text-slate-400 w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900">{total}</h3>
              <span className="text-[10px] font-medium text-slate-400">participantes</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presentes</p>
              <CheckCircle2 className="text-emerald-500 w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900">{present}</h3>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] px-1.5 py-0">
                {total > 0 ? Math.round((present/total)*100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ausentes</p>
              <Clock className="text-amber-500 w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900">{total - present}</h3>
              <span className="text-[10px] font-medium text-slate-400">aguardando</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-900 bg-slate-900 text-white shadow-md overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Ocupação</p>
              <TrendingUp className="text-slate-400 w-4 h-4" />
            </div>
            <h3 className="text-2xl font-bold">{Math.round(progress)}%</h3>
            <Progress value={progress} className="h-1.5 bg-white/10 mt-3" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/dashboard/checkin" className="group">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-white transition-all flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CheckCircle2 className="text-slate-900 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Check-in</h4>
                    <p className="text-[11px] text-slate-500">Validar entradas via QR Code</p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/tables" className="group">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-white transition-all flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MapPin className="text-slate-900 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Mapa de Mesas</h4>
                    <p className="text-[11px] text-slate-500">Gerenciar assentos e ocupação</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Detalhes do Evento</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Localização</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{eventSettings.location || 'Não definido'}</span>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Grid3X3 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Configuração de Mesas</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{eventSettings.totalTables} mesas ({eventSettings.capacityPerTable} lug/cada)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Atividade Recente</CardTitle>
            <Clock className="w-4 h-4 text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {recentCheckins.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-xs text-slate-400 font-medium">Nenhuma atividade registrada.</p>
                </div>
              ) : (
                recentCheckins.map((p, i) => (
                  <div key={p.id} className="flex gap-3 relative">
                    {i !== recentCheckins.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-[-20px] w-px bg-slate-100" />
                    )}
                    <div className="z-10 bg-emerald-50 border border-emerald-100 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="text-emerald-600 w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        {format(new Date(p.checkinTime!), 'HH:mm')} • Mesa {p.table}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentCheckins.length > 0 && (
              <Button variant="link" className="w-full mt-6 text-xs font-bold text-slate-500 hover:text-slate-900 p-0 h-auto" asChild>
                <Link href="/dashboard/reports" className="flex items-center justify-center gap-1">
                  Ver relatório completo
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}