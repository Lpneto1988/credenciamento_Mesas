"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
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
        </CardHeader>
        <CardContent className="pb-12 px-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-bold ml-1">Usuário</Label>
              <Input 
                id="username" 
                placeholder="Digite seu usuário" 
                className="h-12 rounded-2xl border-slate-200 focus-visible:ring-primary/20"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold ml-1">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                className="h-12 rounded-2xl border-slate-200 focus-visible:ring-primary/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Entrar no Sistema"
              )}
            </Button>
            <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-wider">
              Acesso restrito a organizadores
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}