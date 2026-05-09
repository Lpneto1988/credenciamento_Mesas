"use client";

import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UserPlus, Trash2, Shield, Key, Loader2 } from "lucide-react";

export default function OperatorsPage() {
  const { operators, addOperator, deleteOperator } = useStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setIsLoading(true);
    try {
      await addOperator(username, password);
      setUsername("");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminGuard>
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Operadores</h1>
        <p className="text-muted-foreground">Crie acessos reais para sua equipe de check-in</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Novo Operador</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="op-user">Usuário</Label>
                <Input 
                  id="op-user" 
                  placeholder="Ex: joao_checkin" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-[10px] text-slate-400">Apenas nome de usuário, sem necessidade de email</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="op-pass">Senha</Label>
                <Input 
                  id="op-pass" 
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Criar Acesso Real
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Operadores Ativos</h3>
          {operators.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed rounded-xl text-muted-foreground">
              Nenhum operador cadastrado no banco.
            </div>
          ) : (
            <div className="grid gap-4">
              {operators.map(op => (
                <Card key={op.id} className="overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold block">{op.nome}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Key className="w-3 h-3" /> Acesso Ativo
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if(confirm(`Remover acesso de ${op.nome}?`)) deleteOperator(op.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </AdminGuard>
  );
}