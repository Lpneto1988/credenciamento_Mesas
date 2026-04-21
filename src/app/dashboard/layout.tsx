"use client";

import { useStore } from "@/context/StoreContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Tags, 
  Upload, 
  FileText, 
  LogOut, 
  Menu,
  CheckCircle2,
  Settings,
  Grid3X3,
  Home
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MadeWithDyad } from "@/components/made-with-dyad";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  const navItems = [
    { name: 'Início', href: '/dashboard', icon: Home, roles: ['admin', 'operator'] },
    { name: 'Check-in', href: '/dashboard/checkin', icon: CheckCircle2, roles: ['admin', 'operator'] },
    { name: 'Mapa de Mesas', href: '/dashboard/tables', icon: Grid3X3, roles: ['admin', 'operator'] },
    { name: 'Participantes', href: '/dashboard/participants', icon: Users, roles: ['admin'] },
    { name: 'Categorias', href: '/dashboard/categories', icon: Tags, roles: ['admin'] },
    { name: 'Importar', href: '/dashboard/import', icon: Upload, roles: ['admin'] },
    { name: 'Relatórios', href: '/dashboard/reports', icon: FileText, roles: ['admin'] },
    { name: 'Configurações', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(currentUser.role));

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-10 h-10">
            <Image src="/logo.png" alt="Orion" fill className="object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">ORION</h1>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tecnologia para Eventos</p>
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Usuário</p>
          <p className="text-sm font-bold text-slate-700 truncate">{currentUser.name}</p>
          <Badge variant="outline" className="mt-2 text-[9px] font-black uppercase tracking-wider bg-white">
            {currentUser.role === 'admin' ? 'Administrador' : 'Operador'}
          </Badge>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {filteredNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
              pathname === item.href 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-white" : "text-slate-400")} />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-6 border-t space-y-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start h-12 rounded-2xl font-bold text-destructive hover:text-destructive hover:bg-destructive/5"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair do Sistema
        </Button>
        <MadeWithDyad />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r bg-white shadow-sm z-20">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-white z-20">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="Orion" fill className="object-contain" />
            </div>
            <h1 className="font-black tracking-tighter">ORION</h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-none">
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-4 md:p-10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}