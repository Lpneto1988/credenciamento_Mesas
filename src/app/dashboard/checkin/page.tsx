"use client";

import { useState, useMemo, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Check, 
  UserCheck, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Printer, 
  X, 
  Users, 
  QrCode, 
  Camera,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { Participant } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "sonner";

export default function CheckinPage() {
  const { participants, categories, performCheckin } = useStore();
  const [search, setSearch] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const total = participants.length;
  const present = participants.filter(p => p.status === 'presente').length;
  const progress = total > 0 ? (present / total) * 100 : 0;

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
    if (p.status === 'presente') {
      toast.warning(`${p.name} já realizou check-in.`);
      return;
    }
    performCheckin(p.id);
    setSelectedParticipant(p);
    setShowSuccess(true);
    setSearch("");
    setIsScanning(false);
  };

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          const participant = participants.find(p => p.id === decodedText || p.cpf === decodedText);
          if (participant) {
            handleCheckin(participant);
            scanner?.clear();
          } else {
            toast.error("QR Code inválido ou participante não encontrado.");
          }
        },
        (error) => {
          // Silently handle scan errors
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [isScanning, participants]);

  const handlePrint = () => {
    if (!selectedParticipant) return;
    const category = categories.find(c => c.id === selectedParticipant.categoryId);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Etiqueta - ${selectedParticipant.name}</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .label { border: 2px solid black; padding: 40px; width: 400px; text-align: center; border-radius: 10px; }
            .name { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
            .category { font-size: 18px; color: #666; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
            .table-box { background: #000; color: #fff; padding: 20px; border-radius: 10px; }
            .table-label { font-size: 14px; margin-bottom: 5px; }
            .table-num { font-size: 72px; font-weight: 900; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="name">${selectedParticipant.name}</div>
            <div class="category">${category?.name || 'Participante'}</div>
            <div class="table-box">
              <div class="table-label">MESA</div>
              <div class="table-num">${selectedParticipant.table}</div>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (showSuccess && selectedParticipant) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in duration-300 px-2">
        <Card className="border-none shadow-2xl overflow-hidden rounded-[3rem]">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-12 flex justify-center relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <div className="bg-white/20 backdrop-blur-xl rounded-full p-8 border border-white/30 shadow-2xl">
              <ShieldCheck className="text-white w-24 h-24" />
            </div>
          </div>
          <CardContent className="p-10 text-center space-y-8 bg-white">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedParticipant.name}</h2>
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-xl uppercase tracking-widest">
                <Sparkles className="w-5 h-5" />
                Acesso Liberado
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-[2.5rem] p-10 border-2 border-dashed border-slate-200 relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-slate-400 uppercase tracking-[0.3em] text-[10px] font-black mb-4">Localização Designada</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Mesa</span>
                <span className="text-9xl font-black text-primary tabular-nums leading-none">{selectedParticipant.table}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                size="lg" 
                className="w-full h-20 text-2xl font-black rounded-3xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                onClick={() => {
                  setShowSuccess(false);
                  setSelectedParticipant(null);
                }}
              >
                Próximo Check-in
              </Button>
              <Button variant="outline" className="h-14 rounded-2xl gap-3 font-bold border-2" onClick={handlePrint}>
                <Printer className="w-5 h-5" />
                Imprimir Etiqueta de Acesso
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress Header */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-widest">
            <Users className="w-4 h-4 text-primary" />
            Fluxo de Entrada
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-primary">{present}</span>
            <span className="text-slate-300 font-black text-xl"> / {total}</span>
          </div>
        </div>
        <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-center space-y-3">
        <h1 className="text-5xl font-black tracking-tighter text-slate-900">Check-in</h1>
        <p className="text-slate-500 text-xl font-medium">Identifique o participante para liberar o acesso</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-primary/5 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-8 h-8 group-focus-within:text-primary transition-colors" />
            <Input 
              className="h-24 pl-20 pr-8 text-3xl font-bold rounded-[2rem] shadow-2xl border-none bg-white focus-visible:ring-4 focus-visible:ring-primary/10 placeholder:text-slate-200"
              placeholder="Nome ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <Button 
          variant={isScanning ? "destructive" : "secondary"} 
          size="lg" 
          className="h-20 rounded-[2rem] font-black text-xl gap-4 shadow-xl border-2 border-transparent hover:border-primary/20 transition-all"
          onClick={() => setIsScanning(!isScanning)}
        >
          {isScanning ? (
            <>
              <X className="w-7 h-7" />
              Cancelar Leitura
            </>
          ) : (
            <>
              <Camera className="w-7 h-7" />
              Escanear QR Code
            </>
          )}
        </Button>
      </div>

      {isScanning && (
        <Card className="overflow-hidden rounded-[3rem] border-4 border-primary/20 bg-slate-900 shadow-2xl">
          <CardContent className="p-0 relative">
            <div id="reader" className="w-full"></div>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-white/30 rounded-[3rem] border-dashed animate-[spin_10s_linear_infinite]" />
              <div className="absolute w-72 h-1 bg-primary/50 blur-sm animate-[bounce_2s_infinite]" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {search.length >= 3 && filteredParticipants.length === 0 && (
          <Card className="bg-white/50 border-dashed border-4 rounded-[2.5rem]">
            <CardContent className="p-16 text-center space-y-4">
              <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <X className="text-slate-300 w-10 h-10" />
              </div>
              <p className="text-slate-400 font-bold text-xl">Nenhum registro encontrado para "{search}"</p>
            </CardContent>
          </Card>
        )}

        {filteredParticipants.map(p => {
          const category = categories.find(c => c.id === p.categoryId);
          const isPresent = p.status === 'presente';

          return (
            <Card key={p.id} className={cn(
              "overflow-hidden transition-all border-none shadow-lg hover:shadow-2xl rounded-[2rem] group",
              isPresent ? "opacity-60 bg-slate-50" : "bg-white hover:scale-[1.01]"
            )}>
              <CardContent className="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex-1 min-w-0 space-y-2 w-full">
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <h3 className="font-black text-2xl truncate text-slate-900">{p.name}</h3>
                    {category && (
                      <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest" style={{ backgroundColor: `${category.color}15`, color: category.color, borderColor: `${category.color}30` }}>
                        {category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-slate-400">
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest opacity-50">Documento</span> {p.cpf}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest opacity-50">Mesa</span> <span className="text-primary font-black text-lg">{p.table}</span>
                    </span>
                  </div>
                </div>

                {isPresent ? (
                  <div className="flex items-center gap-3 text-amber-600 font-black bg-amber-50 px-6 py-4 rounded-2xl border-2 border-amber-100 w-full sm:w-auto justify-center">
                    <AlertCircle className="w-6 h-6" />
                    <span className="uppercase tracking-widest text-xs">Já Presente</span>
                  </div>
                ) : (
                  <Button 
                    size="lg" 
                    className="h-16 px-10 font-black text-lg rounded-2xl shadow-xl shadow-primary/10 w-full sm:w-auto group-hover:scale-105 transition-transform"
                    onClick={() => handleCheckin(p)}
                  >
                    <UserCheck className="w-6 h-6 mr-3" />
                    Realizar Check-in
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}

        {search.length === 0 && !isScanning && recentCheckins.length > 0 && (
          <div className="pt-12 space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                <Clock className="w-4 h-4" />
                Atividade Recente
              </h2>
            </div>
            <div className="grid gap-4">
              {recentCheckins.map(p => (
                <div key={p.id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <Check className="text-emerald-500 w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-lg truncate">{p.name}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mesa {p.table} • {format(new Date(p.checkinTime!), 'HH:mm')}</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-200 w-6 h-6" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}