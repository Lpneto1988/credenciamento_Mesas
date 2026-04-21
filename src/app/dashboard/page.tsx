"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/context/StoreContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Check, UserCheck, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { Participant } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function CheckinPage() {
  const { participants, categories, performCheckin } = useStore();
  const [search, setSearch] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredParticipants = useMemo(() => {
    if (search.length < 3) return [];
    const term = search.toLowerCase();
    return participants.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.cpf.includes(term)
    ).slice(0, 5);
  }, [participants, search]);

  const recentCheckins = useMemo(() => {
    return participants
      .filter(p => p.status === 'presente' && p.checkinTime)
      .sort((a, b) => new Date(b.checkinTime!).getTime() - new Date(a.checkinTime!).getTime())
      .slice(0, 3);
  }, [participants]);

  const handleCheckin = (p: Participant) => {
    if (p.status === 'presente') return;
    performCheckin(p.id);
    setSelectedParticipant(p);
    setShowSuccess(true);
    setSearch("");
  };

  if (showSuccess && selectedParticipant) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in duration-300">
        <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-12 flex justify-center">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-6 border border-white/30">
              <Check className="text-white w-20 h-20" />
            </div>
          </div>
          <CardContent className="p-10 text-center space-y-8 bg-white">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedParticipant.name}</h2>
              <p className="text-emerald-600 font-semibold text-xl">Entrada Autorizada</p>
            </div>
            
            <div className="bg-slate-50 rounded-3xl p-10 border-2 border-dashed border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
              <p className="text-slate-400 uppercase tracking-[0.2em] text-xs font-black mb-4">Localização / Mesa</p>
              <span className="text-9xl font-black text-primary tabular-nums">{selectedParticipant.table}</span>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                size="lg" 
                className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                onClick={() => {
                  setShowSuccess(false);
                  setSelectedParticipant(null);
                }}
              >
                Próximo Check-in
              </Button>
              <Button variant="ghost" className="text-muted-foreground">
                Imprimir Etiqueta (Simulado)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Check-in</h1>
        <p className="text-slate-500 text-lg">Localize o participante para liberar a entrada</p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-7 h-7" />
          <Input 
            className="h-20 pl-16 pr-6 text-2xl rounded-2xl shadow-xl border-none bg-white focus-visible:ring-2 focus-visible:ring-primary/20"
            placeholder="Nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="space-y-4">
        {search.length >= 3 && filteredParticipants.length === 0 && (
          <Card className="bg-white/50 border-dashed border-2 rounded-2xl">
            <CardContent className="p-12 text-center space-y-3">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <X className="text-slate-400 w-8 h-8" />
              </div>
              <p className="text-slate-500 font-medium">Nenhum participante encontrado com "{search}"</p>
            </CardContent>
          </Card>
        )}

        {filteredParticipants.map(p => {
          const category = categories.find(c => c.id === p.categoryId);
          const isPresent = p.status === 'presente';

          return (
            <Card key={p.id} className={cn(
              "overflow-hidden transition-all border-none shadow-sm hover:shadow-md rounded-2xl",
              isPresent ? "opacity-60 bg-slate-50" : "bg-white"
            )}>
              <CardContent className="p-6 flex items-center justify-between gap-6">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-xl truncate text-slate-900">{p.name}</h3>
                    {category && (
                      <Badge variant="outline" className="rounded-full px-3" style={{ backgroundColor: `${category.color}15`, color: category.color, borderColor: `${category.color}30` }}>
                        {category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-6 text-sm font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-300">CPF</span> {p.cpf}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-300">MESA</span> <span className="text-primary font-bold">{p.table}</span>
                    </span>
                  </div>
                </div>

                {isPresent ? (
                  <div className="flex items-center gap-2 text-amber-600 font-bold bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100">
                    <AlertCircle className="w-5 h-5" />
                    <span>Já Presente</span>
                  </div>
                ) : (
                  <Button 
                    size="lg" 
                    className="h-14 px-8 font-bold rounded-xl shadow-lg shadow-primary/10"
                    onClick={() => handleCheckin(p)}
                  >
                    <UserCheck className="w-5 h-5 mr-2" />
                    Check-in
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}

        {search.length === 0 && recentCheckins.length > 0 && (
          <div className="pt-8 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Check-ins Recentes
              </h2>
            </div>
            <div className="grid gap-3">
              {recentCheckins.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Check className="text-emerald-500 w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-400">Mesa {p.table} • {format(new Date(p.checkinTime!), 'HH:mm')}</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-200 w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}