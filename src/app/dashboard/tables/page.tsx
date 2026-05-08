"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/context/StoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserCheck, UserX, CheckCircle2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function TablesPage() {
  const { participants, eventSettings, categories, performCheckin } = useStore();
  const [search, setSearch] = useState("");

  const tables = Array.from({ length: eventSettings.totalTables }, (_, i) => i + 1);

  const handleQuickCheckin = (id: string, name: string) => {
    performCheckin(id);
    toast.success(`Check-in de ${name} realizado com sucesso!`);
  };

  const searchResults = useMemo(() => {
    if (search.length < 2) return [];
    return participants.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.cpf.includes(search)
    ).slice(0, 5);
  }, [participants, search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Mapa de Mesas</h1>
          <p className="text-slate-500">Visualize a ocupação e localize participantes rapidamente.</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Localizar participante..." 
            className="pl-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          {search.length >= 2 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-400">Ninguém encontrado</div>
              ) : (
                searchResults.map(p => (
                  <button 
                    key={p.id}
                    className="w-full p-4 text-left hover:bg-slate-50 flex items-center justify-between border-b last:border-none"
                    onClick={() => {
                      setSearch("");
                      toast.info(`${p.name} está na Mesa ${p.table}`);
                    }}
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">Mesa {p.table}</p>
                    </div>
                    <Badge variant={p.status === 'presente' ? 'default' : 'secondary'} className="text-[10px]">
                      {p.status === 'presente' ? 'Presente' : 'Ausente'}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {tables.map(tableNum => {
          const tableParticipants = participants.filter(p => p.table === tableNum);
          const presentCount = tableParticipants.filter(p => p.status === 'presente').length;
          const totalCount = tableParticipants.length;
          
          const isFull = totalCount >= eventSettings.capacityPerTable;
          const allPresent = totalCount > 0 && presentCount === totalCount;

          return (
            <Dialog key={tableNum}>
              <DialogTrigger asChild>
                <Card className={cn(
                  "cursor-pointer transition-all hover:scale-105 hover:shadow-xl border-2",
                  allPresent ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 bg-white",
                  isFull && !allPresent ? "border-amber-200" : ""
                )}>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                      {tableNum}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ocupação</p>
                      <p className="text-lg font-bold text-slate-900">
                        {totalCount} <span className="text-slate-300">/ {eventSettings.capacityPerTable}</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-emerald-600 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> {presentCount}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <UserX className="w-3 h-3" /> {totalCount - presentCount}
                        </span>
                      </div>
                      <Progress value={(presentCount / (totalCount || 1)) * 100} className="h-1.5 bg-slate-100" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-2xl font-black">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-xl shadow-lg shadow-primary/20">
                      {tableNum}
                    </div>
                    Mesa {tableNum}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Detalhes da ocupação e lista de participantes da mesa {tableNum}.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Inscritos</p>
                      <p className="text-2xl font-black text-slate-900">{totalCount}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Presentes</p>
                      <p className="text-2xl font-black text-emerald-700">{presentCount}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                      <Users className="w-4 h-4" />
                      Lista de Ocupantes
                    </h4>
                    <div className="space-y-2 max-h-80 overflow-auto pr-2 custom-scrollbar">
                      {tableParticipants.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                          <p className="text-slate-400 text-sm font-medium">Nenhum participante nesta mesa.</p>
                        </div>
                      ) : (
                        tableParticipants.map(p => {
                          const category = categories.find(c => c.id === p.categoryId);
                          const isPresent = p.status === 'presente';
                          return (
                            <div key={p.id} className={cn(
                              "flex items-center justify-between p-4 rounded-2xl border transition-all",
                              isPresent 
                                ? "bg-emerald-50/50 border-emerald-100 opacity-70" 
                                : "bg-white border-slate-100 shadow-sm hover:border-primary/30"
                            )}>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{p.name}</p>
                                {category && (
                                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: category.color }}>
                                    {category.name}
                                  </span>
                                )}
                              </div>
                              
                              {isPresent ? (
                                <div className="bg-emerald-500 text-white p-1.5 rounded-full">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="rounded-xl font-bold text-xs h-8 hover:bg-primary hover:text-white transition-colors"
                                  onClick={() => handleQuickCheckin(p.id, p.name)}
                                >
                                  Check-in
                                </Button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}