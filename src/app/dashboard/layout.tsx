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
  Grid3x3,
  Home,
  ChevronRight,
  ShieldAlert
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
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'operador'] },
    { name: 'Check-in', href: '/dashboard/checkin', icon: CheckCircle2, roles: ['admin', 'operador'] },
    { name: 'Mapa de Mesas', href: '/dashboard/tables', icon: Grid3x3, roles: ['admin', 'operador'] },
    { name: 'Participantes', href: '/dashboard/participants', icon: Users, roles: ['admin'] },
    { name: 'Operadores', href: '/dashboard/operators', icon: ShieldAlert, roles: ['admin'] },
    { name: 'Categorias', href: '/dashboard/categories', icon: Tags, roles: ['admin'] },
    { name: 'Importar Dados', href: '/dashboard/import', icon: Upload, roles: ['admin'] },
    { name: 'Relatórios', href: '/dashboard/reports', icon: FileText, roles: ['admin'] },
    { name: 'Configurações', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(currentUser.role));

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-32 h-32 shrink-0">
            <Image src="/logo.png" alt="Orion" fill className="object-contain" priority />
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.nome || "Usuário"}</p>
            <p className="text-[10px] text-slate-500 capitalize">{currentUser?.role || "Acesso"}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu Principal</p>
        {filteredNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              pathname === item.href 
                ? "bg-slate-900 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("w-4 h-4", pathname === item.href ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
              {item.name}
            </div>
            {pathname === item.href && <ChevronRight className="w-3 h-3 opacity-50" />}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <Button 
          variant="ghost" 
          className="w-full justify-start h-10 rounded-lg text-sm font-medium text-slate-500 hover:text-destructive hover:bg-destructive/5"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sair do Sistema
        </Button>
        <div className="mt-4 opacity-50">
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white z-20">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white z-20">
          <div className="flex items-center">
            <div className="relative w-24 h-24">
              <Image src="/logo.png" alt="Orion" fill className="object-contain" priority />
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-none">
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}