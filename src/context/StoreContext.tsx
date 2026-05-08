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
        supabase.from('event_settings').select('*').single(),
        supabase.from('profiles').select('*').eq('role', 'operator')
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
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          username: session.user.user_metadata.username || session.user.email?.split('@')[0],
          role: session.user.user_metadata.role || 'operator'
        });
      }
      fetchData();
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          username: session.user.user_metadata.username || session.user.email?.split('@')[0],
          role: session.user.user_metadata.role || 'operator'
        });
      } else {
        setCurrentUser(null);
      }
    });

    // Real-time DB changes
    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_settings' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const login = async (username: string, pass: string) => {
    const email = username.includes('@') ? username : `${username.toLowerCase()}@orion.com`;
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    
    if (error) {
      toast.error("Usuário ou senha inválidos");
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
      email: p.email,
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
      email: updates.email,
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
    const { error } = await supabase.auth.signUp({
      email: `${username.toLowerCase()}@orion.com`,
      password: pass,
      options: { data: { username, role: 'operator' } }
    });
    if (error) throw error;
    toast.success(`Operador ${username} criado!`);
  };

  const deleteOperator = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    toast.success("Acesso removido!");
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