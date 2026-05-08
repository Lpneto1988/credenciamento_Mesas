"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Participant {
  id: string;
  name: string;
  email: string | null;
  cpf: string;
  category_id: string | null;
  table: number;
  status: 'presente' | 'ausente';
  checkin_time: string | null;
  operator_id: string | null;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface EventSettings {
  name: string;
  date: string;
  location: string;
  total_tables: number;
  capacity_per_table: number;
}

interface Operator {
  id: string;
  username: string;
  role: string;
}

interface StoreContextType {
  participants: Participant[];
  categories: Category[];
  eventSettings: EventSettings;
  operators: Operator[];
  isLoading: boolean;
  addParticipant: (p: Omit<Participant, 'id' | 'status' | 'checkin_time' | 'operator_id'>) => Promise<void>;
  updateParticipant: (id: string, updates: Partial<Participant>) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  addCategory: (name: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateEventSettings: (settings: Partial<EventSettings>) => Promise<void>;
  addOperator: (username: string, pass: string) => Promise<void>;
  deleteOperator: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [eventSettings, setEventSettings] = useState<EventSettings>({
    name: "Meu Evento",
    date: new Date().toISOString().split('T')[0],
    location: "",
    total_tables: 20,
    capacity_per_table: 10
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

      if (pRes.data) setParticipants(pRes.data);
      if (cRes.data) setCategories(cRes.data);
      if (sRes.data) setEventSettings(sRes.data);
      if (oRes.data) setOperators(oRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time subscriptions
    const pSub = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_settings' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(pSub);
    };
  }, []);

  const addParticipant = async (p: any) => {
    const { error } = await supabase.from('participants').insert([p]);
    if (error) {
      toast.error("Erro ao adicionar participante");
      throw error;
    }
    toast.success("Participante adicionado!");
  };

  const updateParticipant = async (id: string, updates: any) => {
    const { error } = await supabase.from('participants').update(updates).eq('id', id);
    if (error) {
      toast.error("Erro ao atualizar");
      throw error;
    }
  };

  const deleteParticipant = async (id: string) => {
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (error) {
      toast.error("Erro ao remover");
      throw error;
    }
    toast.success("Removido com sucesso");
  };

  const addCategory = async (name: string, color: string) => {
    const { error } = await supabase.from('categories').insert([{ name, color }]);
    if (error) {
      toast.error("Erro ao criar categoria");
      throw error;
    }
    toast.success("Categoria criada!");
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast.error("Erro ao remover categoria");
      throw error;
    }
    toast.success("Categoria removida");
  };

  const updateEventSettings = async (settings: any) => {
    const { error } = await supabase.from('event_settings').update(settings).eq('id', eventSettings.id as any);
    if (error) {
      toast.error("Erro ao salvar configurações");
      throw error;
    }
    toast.success("Configurações salvas!");
  };

  const addOperator = async (username: string, pass: string) => {
    try {
      // 1. Criar o usuário no Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${username.toLowerCase()}@orion.com`,
        password: pass,
        options: {
          data: {
            username: username,
            role: 'operator'
          }
        }
      });

      if (authError) throw authError;
      
      toast.success(`Operador ${username} criado com sucesso!`);
      await fetchData(); // Forçar atualização da lista
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar operador");
      throw error;
    }
  };

  const deleteOperator = async (id: string) => {
    // Nota: No Supabase Client (anon key), não podemos deletar usuários do Auth diretamente.
    // Mas podemos remover o perfil para que ele não apareça na lista.
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      toast.error("Erro ao remover acesso");
      throw error;
    }
    toast.success("Acesso removido");
    await fetchData();
  };

  return (
    <StoreContext.Provider value={{
      participants,
      categories,
      eventSettings,
      operators,
      isLoading,
      addParticipant,
      updateParticipant,
      deleteParticipant,
      addCategory,
      deleteCategory,
      updateEventSettings,
      addOperator,
      deleteOperator,
      refreshData: fetchData
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}