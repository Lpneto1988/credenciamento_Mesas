"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";

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
      <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] overflow-hidden">
        <CardHeader className="space-y-4 text-center pt-12">
          <div className="mx-auto relative w-32 h-32 mb-2">
            <Image 
              src="/logo.png" 
              alt="Orion Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter">ORION</CardTitle>
            <CardDescription className="font-medium text-slate-500 uppercase tracking-widest text-[10px]">Tecnologia para Eventos</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pb-12 px-10">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold ml-1">E-mail</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="exemplo@email.com" 
              className="h-12 rounded-2xl border-slate-200 focus-visible:ring-primary/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold ml-1">Senha</Label>
            <Input 
              id="password" 
              type="password" 
              className="h-12 rounded-2xl border-slate-200 focus-visible:ring-primary/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Button onClick={() => handleLogin('operator')} variant="outline" className="h-14 rounded-2xl font-bold border-2">
              Operador
            </Button>
            <Button onClick={() => handleLogin('admin')} className="h-14 rounded-2xl font-bold shadow-lg shadow-primary/20">
              Administrador
            </Button>
          </div>
          <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-wider">
            Acesso restrito a organizadores
          </p>
        </CardContent>
      </Card>
    </div>
  );
}