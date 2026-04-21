"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/context/StoreContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Check, UserCheck, AlertCircle, X } from "lucide-react";
import { Participant } from "@/types";

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
        <Card className="border-2 border-green-500 shadow-lg overflow-hidden">
          <div className="bg-green-500 p-8 flex justify-center">
            <div className="bg-white rounded-full p-4">
              <Check className="text-green-500 w-16 h-16" />
            </div>
          </div>
          <CardContent className="p-8 text-center space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{selectedParticipant.name}</h2>
              <p className="text-green-600 font-medium text-lg mt-2">Check-in realizado com sucesso!</p>
            </div>
            
            <div className="bg-slate-100 rounded-2xl p-8 border-2 border-dashed border-slate-300">
              <p className="text-slate-500 uppercase tracking-widest text-sm font-bold mb-2">Mesa</p>
              <span className="text-8xl font-black text-primary">{selectedParticipant.table}</span>
            </div>

            <Button 
              size="lg" 
              className="w-full h-16 text-xl font-bold rounded-xl"
              onClick={() => {
                setShowSuccess(false);
                setSelectedParticipant(null);
              }}
            >
              Próximo Check-in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Check-in de Participantes</h1>
        <p className="text-muted-foreground">Busque por nome ou CPF para registrar a entrada</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
        <Input 
          className="h-16 pl-14 pr-4 text-xl rounded-2xl shadow-sm border-2 focus-visible:ring-primary"
          placeholder="Digite o nome ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-4">
        {search.length >= 3 && filteredParticipants.length === 0 && (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhum participante encontrado com "{search}"
            </CardContent>
          </Card>
        )}

        {filteredParticipants.map(p => {
          const category = categories.find(c => c.id === p.categoryId);
          const isPresent = p.status === 'presente';

          return (
            <Card key={p.id} className={cn(
              "overflow-hidden transition-all hover:shadow-md",
              isPresent ? "opacity-75 bg-slate-50" : "border-l-4"
            )} style={{ borderLeftColor: isPresent ? undefined : category?.color }}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg truncate">{p.name}</h3>
                    {category && (
                      <Badge variant="outline" style={{ backgroundColor: `${category.color}10`, color: category.color, borderColor: category.color }}>
                        {category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>CPF: {p.cpf}</span>
                    <span>Mesa: <span className="font-bold text-primary">{p.table}</span></span>
                  </div>
                </div>

                {isPresent ? (
                  <div className="flex items-center gap-2 text-amber-600 font-medium bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    <AlertCircle className="w-5 h-5" />
                    <span>Já Presente</span>
                  </div>
                ) : (
                  <Button 
                    size="lg" 
                    className="h-12 px-6 font-bold rounded-xl"
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

        {search.length > 0 && search.length < 3 && (
          <p className="text-center text-sm text-muted-foreground">
            Continue digitando para buscar...
          </p>
        )}
      </div>
    </div>
  );
}