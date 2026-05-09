"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Participant, Category, EventSettings, Operator } from "@/types";

interface StoreContextType {
  currentUser: User | null;
  participants: Participant[];
  categories: Category[];
  eventSettings: EventSettings;
  operators: Operator[];
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addParticipant: (p: any) => Promise<void>;
  updateParticipant: (id: string, updates: any) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  importParticipants: (data: any[]) => { success: number; errors: string[] };
  addCategory: (name: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  addOperator: (username: string, pass: string) => Promise<void>;
  deleteOperator: (id: string) => Promise<void>;
  performCheckin: (id: string) => Promise<void>;
  bulkDeleteParticipants: (ids: string[]) => Promise<void>;
  bulkCheckinParticipants: (ids: string[]) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [eventSettings, setEventSettings] = useState<EventSettings>({
    name: "Meu Evento",
    date: new Date().toISOString().split('T')[0],
    location: "",
    totalTables: 20,
    capacityPerTable: 10
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [pRes, cRes, sRes, oRes] = await Promise.all([
        supabase.from('participants').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('event_settings').select('*').maybeSingle(),
        supabase.from('usuarios').select('*').eq('role', 'operador').order('nome')
      ]);

      if (pRes.data) {
        setParticipants(pRes.data.map((p: any) => ({
          ...p,
          categoryId: p.category_id,
          checkinTime: p.checkin_time,
          operatorId: p.operator_id
        })));
      }
      if (cRes.data) setCategories(cRes.data);
      if (sRes.data) {
        setEventSettings({
          ...sRes.data,
          totalTables: sRes.data.total_tables,
          capacityPerTable: sRes.data.capacity_per_table
        });
      }
      if (oRes.data) setOperators(oRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Buscar dados do usuário na tabela usuarios
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setCurrentUser({
          id: session.user.id,
          nome: userData?.nome || session.user.user_metadata.nome || session.user.email?.split('@')[0] || 'Usuário',
          role: userData?.role || session.user.user_metadata.role || 'operador'
        });
      }
      fetchData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Buscar dados do usuário na tabela usuarios
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setCurrentUser({
          id: session.user.id,
          nome: userData?.nome || session.user.user_metadata.nome || session.user.email?.split('@')[0] || 'Usuário',
          role: userData?.role || session.user.user_metadata.role || 'operador'
        });
      } else {
        setCurrentUser(null);
      }
    });

    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_settings' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, () => fetchData())
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const login = async (username: string, pass: string) => {
    // Gera email automaticamente para o Supabase (invisível ao usuário)
    const email = `${username.toLowerCase().trim()}@sistema.com`;
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password: pass 
    });
    
    if (error) {
      console.error("[Login Error]", error);
      if (error.status === 400) {
        toast.error("Usuário ou senha incorretos.");
      } else {
        toast.error(error.message || "Erro ao tentar entrar.");
      }
      return false;
    }
    
    toast.success("Bem-vindo!");
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const addParticipant = async (p: any) => {
    const { error } = await supabase.from('participants').insert([{
      name: p.name,
      email: p.email || null,
      cpf: p.cpf,
      category_id: p.categoryId,
      table: p.table,
      status: 'ausente'
    }]);
    if (error) throw error;
    toast.success("Participante adicionado!");
  };

  const updateParticipant = async (id: string, updates: any) => {
    const { error } = await supabase.from('participants').update({
      name: updates.name,
      email: updates.email || null,
      cpf: updates.cpf,
      category_id: updates.categoryId,
      table: updates.table
    }).eq('id', id);
    if (error) throw error;
    toast.success("Atualizado com sucesso!");
  };

  const deleteParticipant = async (id: string) => {
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (error) throw error;
    toast.success("Removido!");
  };

  const importParticipants = (data: any[]) => {
    let success = 0;
    const errors: string[] = [];

    data.forEach((row, index) => {
      try {
        // Validação básica
        if (!row.name || !row.cpf || !row.category) {
          errors.push(`Linha ${index + 1}: Campos obrigatórios faltando (name, cpf, category)`);
          return;
        }

        // Adicionar participante (versão síncrona para batch)
        addParticipant({
          name: row.name,
          cpf: row.cpf,
          category: row.category,
          table: row.table || null,
          status: row.status || 'pending'
        });

        success++;
      } catch (error) {
        errors.push(`Linha ${index + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    });

    return { success, errors };
  };

  const addCategory = async (name: string, color: string) => {
    const { error } = await supabase.from('categories').insert([{ name, color }]);
    if (error) throw error;
    toast.success("Categoria criada!");
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    toast.success("Categoria removida!");
  };

  const updateSettings = async (settings: any) => {
    const { error } = await supabase.from('event_settings').update({
      name: settings.name,
      date: settings.date,
      location: settings.location,
      total_tables: settings.totalTables,
      capacity_per_table: settings.capacityPerTable
    }).eq('id', eventSettings.id as any);
    if (error) throw error;
    toast.success("Configurações salvas!");
  };

  const addOperator = async (username: string, pass: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { username: username.trim(), password: pass, role: 'operador' }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Operador ${username} criado com sucesso!`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar operador");
      throw error;
    }
  };

  const deleteOperator = async (id: string) => {
    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    if (error) throw error;
    toast.success("Acesso removido!");
    fetchData();
  };

  const performCheckin = async (id: string) => {
    const { error } = await supabase.from('participants').update({
      status: 'presente',
      checkin_time: new Date().toISOString(),
      operator_id: currentUser?.id
    }).eq('id', id);
    if (error) throw error;
  };

  const bulkDeleteParticipants = async (ids: string[]) => {
    const { error } = await supabase.from('participants').delete().in('id', ids);
    if (error) throw error;
    toast.success("Participantes removidos!");
  };

  const bulkCheckinParticipants = async (ids: string[]) => {
    const { error } = await supabase.from('participants').update({
      status: 'presente',
      checkin_time: new Date().toISOString(),
      operator_id: currentUser?.id
    }).in('id', ids);
    if (error) throw error;
    toast.success("Check-ins realizados!");
  };

  return (
    <StoreContext.Provider value={{
      currentUser,
      participants,
      categories,
      eventSettings,
      operators,
      isLoading,
      login,
      logout,
      addParticipant,
      updateParticipant,
      deleteParticipant,
      importParticipants,
      addCategory,
      deleteCategory,
      updateSettings,
      addOperator,
      deleteOperator,
      performCheckin,
      bulkDeleteParticipants,
      bulkCheckinParticipants
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error('useStore must be used within a StoreProvider');
  return context;
}