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
  MapPin
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Olá, Bem-vindo!</h1>
          <p className="text-slate-500">Aqui está o resumo do seu evento em tempo real.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-primary/10 p-2 rounded-xl">
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data do Evento</p>
            <p className="text-sm font-bold text-slate-700">
              {eventSettings.date ? format(new Date(eventSettings.date), "dd 'de' MMMM", { locale: ptBR }) : 'Não definida'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-none">Total</Badge>
            </div>
            <p className="text-4xl font-black text-slate-900">{total}</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">Participantes inscritos</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <CheckCircle2 className="text-emerald-600 w-6 h-6" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-none">Presentes</Badge>
            </div>
            <p className="text-4xl font-black text-slate-900">{present}</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">Check-ins realizados</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Clock className="text-amber-600 w-6 h-6" />
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-none">Ausentes</Badge>
            </div>
            <p className="text-4xl font-black text-slate-900">{total - present}</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">Aguardando chegada</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest opacity-70">Taxa de Ocupação</span>
            </div>
            <p className="text-4xl font-black">{Math.round(progress)}%</p>
            <Progress value={progress} className="h-2 bg-white/20 mt-4" />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <Link href="/dashboard/checkin" className="group">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <div className="bg-white w-12 h-12 rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="text-primary w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900">Iniciar Check-in</h3>
                  <p className="text-sm text-slate-500 mt-1">Validar entradas via QR Code ou busca manual.</p>
                </div>
              </Link>
              <Link href="/dashboard/tables" className="group">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <div className="bg-white w-12 h-12 rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="text-primary w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900">Mapa de Mesas</h3>
                  <p className="text-sm text-slate-500 mt-1">Visualizar ocupação e gerenciar assentos.</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader>
              <CardTitle className="text-xl font-black">Informações do Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <MapPin className="text-slate-400 w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Local</p>
                  <p className="font-bold text-slate-700">{eventSettings.location || 'Não informado'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total de Mesas</p>
                  <p className="text-2xl font-black text-slate-700">{eventSettings.totalTables}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Capacidade/Mesa</p>
                  <p className="text-2xl font-black text-slate-700">{eventSettings.capacityPerTable}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black">Atividade Recente</CardTitle>
            <Clock className="w-5 h-5 text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentCheckins.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="text-slate-300 w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Nenhuma atividade ainda.</p>
                </div>
              ) : (
                recentCheckins.map((p, i) => (
                  <div key={p.id} className="flex gap-4 relative">
                    {i !== recentCheckins.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-slate-100" />
                    )}
                    <div className="z-10 bg-emerald-500 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                      <CheckCircle2 className="text-white w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {format(new Date(p.checkinTime!), 'HH:mm')} • Mesa {p.table}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentCheckins.length > 0 && (
              <Button variant="ghost" className="w-full mt-8 text-primary font-bold gap-2 group" asChild>
                <Link href="/dashboard/reports">
                  Ver Relatório Completo
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}