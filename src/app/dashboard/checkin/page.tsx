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
  Maximize2
} from "lucide-react";
import { Participant } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Scanner } from "@yudiel/react-qr-scanner";
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
    if (search.length < 1) return [];
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

      {isScanning && (
        <Card className="overflow-hidden rounded-3xl border-2 border-primary/20 bg-slate-900">
          <CardContent className="p-0 relative">
            <Scanner
              onDecode={(result) => {
                const participant = participants.find(p => p.id === result || p.cpf === result);
                if (participant) {
                  handleCheckin(participant);
                } else {
                  toast.error("QR Code inválido ou participante não encontrado.");
                }
              }}
              onError={(error) => {
                console.log(error?.message);
              }}
              scanDelay={500}
              constraints={{ facingMode: 'environment' }}
              containerStyle={{ width: '100%', paddingTop: '100%' }} // Mantém o aspect ratio
              videoStyle={{ objectFit: 'cover' }}
            />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 sm:w-64 h-64 border-4 border-white/50 rounded-3xl border-dashed animate-pulse" />
              <div className="absolute bottom-4 left-4 right-4 p-2 bg-black/40 backdrop-blur-sm text-white text-xs font-bold rounded-lg text-center">
                Aponte a câmera para o QR Code
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
        <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 sm:p-12 flex justify-center">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-4 sm:p-6 border border-white/30">
              <Check className="text-white w-12 h-12 sm:w-20 h-20" />
            </div>
          </div>
          <CardContent className="p-6 sm:p-10 text-center space-y-6 sm:space-y-8 bg-white">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">{selectedParticipant.name}</h2>
              <p className="text-emerald-600 font-semibold text-lg sm:text-xl">Entrada Autorizada</p>
            </div>
            
            <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border-2 border-dashed border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
              <p className="text-slate-400 uppercase tracking-[0.2em] text-[10px] font-black mb-2 sm:mb-4">Localização / Mesa</p>
              <span className="text-7xl sm:text-9xl font-black text-primary tabular-nums">{selectedParticipant.table}</span>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                size="lg" 
                className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                onClick={() => {
                  setShowSuccess(false);
                  setSelectedParticipant(null);
                }}
              >
                Próximo Check-in
              </Button>
              <Button variant="outline" className="h-12 rounded-xl gap-2" onClick={handlePrint}>
                <Printer className="w-5 h-5" />
                Imprimir Etiqueta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      {/* Progress Header */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] sm:text-sm uppercase tracking-wider">
            <Users className="w-4 h-4" />
            Progresso do Evento
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-primary">{present}</span>
            <span className="text-slate-300 font-bold text-base sm:text-lg"> / {total}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2 sm:h-3 bg-slate-100" />
      </div>

      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Check-in</h1>
        <p className="text-slate-500 text-sm sm:text-base">Localize o participante ou use o QR Code</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>
          <div className="relative">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 sm:w-6 h-6" />
            <Input 
              className="h-14 sm:h-16 pl-12 sm:pl-14 pr-6 text-lg sm:text-xl rounded-2xl shadow-xl border-none bg-white focus-visible:ring-2 focus-visible:ring-primary/20"
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
          className="h-12 sm:h-14 rounded-2xl font-bold text-sm sm:text-base gap-3 shadow-sm"
          onClick={() => setIsScanning(!isScanning)}
        >
          {isScanning ? (
            <>
              <X className="w-5 h-5" />
              Cancelar Leitura
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              Escanear QR Code
            </>
          )}
        </Button>
      </div>


      <div className="space-y-4">
        {search.length >= 3 && filteredParticipants.length === 0 && (
          <Card className="bg-white/50 border-dashed border-2 rounded-2xl">
            <CardContent className="p-8 sm:p-12 text-center space-y-3">
              <div className="bg-slate-100 w-12 h-12 sm:w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <X className="text-slate-400 w-6 h-6 sm:w-8 h-8" />
              </div>
              <p className="text-slate-500 font-medium text-sm sm:text-base">Nenhum participante encontrado com "{search}"</p>
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
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex-1 min-w-0 space-y-1 w-full">
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <h3 className="font-bold text-lg sm:text-xl truncate text-slate-900">{p.name}</h3>
                    {category && (
                      <Badge variant="outline" className="rounded-full px-2 sm:px-3 text-[10px] sm:text-xs" style={{ backgroundColor: `${category.color}15`, color: category.color, borderColor: `${category.color}30` }}>
                        {category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-300">CPF</span> {p.cpf}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-300">MESA</span> <span className="text-primary font-bold">{p.table}</span>
                    </span>
                  </div>
                </div>

                {isPresent ? (
                  <div className="flex items-center gap-2 text-amber-600 font-bold bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 w-full sm:w-auto justify-center">
                    <AlertCircle className="w-4 h-4 sm:w-5 h-5" />
                    <span className="text-sm sm:text-base">Já Presente</span>
                  </div>
                ) : (
                  <Button 
                    size="lg" 
                    className="h-12 sm:h-14 px-8 font-bold rounded-xl shadow-lg shadow-primary/10 w-full sm:w-auto"
                    onClick={() => handleCheckin(p)}
                  >
                    <UserCheck className="w-4 h-4 sm:w-5 h-5 mr-2" />
                    Check-in
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}

        {search.length === 0 && !isScanning && recentCheckins.length > 0 && (
          <div className="pt-6 sm:pt-8 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Clock className="w-3 h-3 sm:w-4 h-4" />
                Check-ins Recentes
              </h2>
            </div>
            <div className="grid gap-3">
              {recentCheckins.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <Check className="text-emerald-500 w-4 h-4 sm:w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm sm:text-base truncate">{p.name}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">Mesa {p.table} • {format(new Date(p.checkinTime!), 'HH:mm')}</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-200 w-4 h-4 sm:w-5 h-5 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}