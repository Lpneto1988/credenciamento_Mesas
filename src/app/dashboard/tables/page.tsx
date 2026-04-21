"use client";

import { useStore } from "@/context/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Users, UserCheck, UserX, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TablesPage() {
  const { participants, eventSettings, categories } = useStore();

  const tables = Array.from({ length: eventSettings.totalTables }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Mapa de Mesas</h1>
        <p className="text-muted-foreground">Visualize a ocupação e o status de cada mesa em tempo real</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {tables.map(tableNum => {
          const tableParticipants = participants.filter(p => p.table === tableNum);
          const presentCount = tableParticipants.filter(p => p.status === 'presente').length;
          const totalCount = tableParticipants.length;
          const occupancyPercent = eventSettings.capacityPerTable > 0 
            ? (totalCount / eventSettings.capacityPerTable) * 100 
            : 0;
          
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
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Ocupação</p>
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
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-2xl font-black">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg">
                      {tableNum}
                    </div>
                    Mesa {tableNum}
                  </DialogTitle>
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
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Lista de Ocupantes
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-auto pr-2">
                      {tableParticipants.length === 0 ? (
                        <p className="text-center py-8 text-slate-400 text-sm italic">Nenhum participante nesta mesa.</p>
                      ) : (
                        tableParticipants.map(p => {
                          const category = categories.find(c => c.id === p.categoryId);
                          return (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{p.name}</p>
                                {category && (
                                  <span className="text-[10px] font-bold uppercase" style={{ color: category.color }}>
                                    {category.name}
                                  </span>
                                )}
                              </div>
                              <Badge variant={p.status === 'presente' ? 'default' : 'secondary'} className={cn(
                                "rounded-full",
                                p.status === 'presente' ? "bg-emerald-500" : "bg-slate-100 text-slate-400"
                              )}>
                                {p.status === 'presente' ? 'OK' : '...'}
                              </Badge>
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