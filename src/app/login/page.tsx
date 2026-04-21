"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useStore();
  const router = useRouter();

  const handleLogin = (role: 'admin' | 'operator') => {
    if (!email || !password) return;
    login(email, role);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <LogIn className="text-primary" size={24} />
          </div>
          <CardTitle className="text-2xl font-bold">EventCheck</CardTitle>
          <CardDescription>Entre para gerenciar o evento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="exemplo@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Button onClick={() => handleLogin('operator')} variant="outline" className="w-full">
              Operador
            </Button>
            <Button onClick={() => handleLogin('admin')} className="w-full">
              Administrador
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Dica: Use qualquer e-mail/senha para testar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}