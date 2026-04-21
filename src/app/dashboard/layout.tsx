"use client";

import { useStore } from "@/context/StoreContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
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
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6" />
          EventCheck
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Logado como: <span className="font-medium">{currentUser.name}</span> ({currentUser.role})
        </p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {filteredNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
        <MadeWithDyad />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-white">
          <h1 className="font-bold text-primary">EventCheck</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}