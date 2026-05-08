"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Participant, Category, EventSettings } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface StoreContextType {
  currentUser: User | null;
  participants: Participant[];
  categories: Category[];
  operators: User[];
  eventSettings: EventSettings;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addParticipant: (p: Omit<Participant, 'id' | 'status'>) => Promise<void>;
  updateParticipant: (id: string, p: Partial<Participant>) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  bulkDeleteParticipants: (ids: string[]) => Promise<void>;
  bulkCheckinParticipants: (ids: string[]) => Promise<void>;
  performCheckin: (participantId: string) => Promise<void>;
  addCategory: (c: Omit<Category, 'id'>) => Promise<string | undefined>;
  deleteCategory: (id: string) => Promise<void>;
  addOperator: (username: string, pass: string) => Promise<void>;
  deleteOperator: (id: string) => Promise<void>;
  updateSettings: (s: EventSettings) => Promise<void>;
  importParticipants: (data: any[]) => Promise<{ success: number; errors: string[] }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [operators, setOperators] = useState<User[]>([]);
  const [eventSettings, setEventSettings] = useState<EventSettings>({
    name: 'Carregando...',
    date: '',
    location: '',
    totalTables: 20,
    capacityPerTable: 10
  });

  useEffect(() => {
    fetchInitialData();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          username: session.user.email?.split('@')[0] || 'Usuário',
          role: 'admin'
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchInitialData = async () => {
    const [parts, cats, settings, ops] = await Promise.all([
      supabase.from('participants').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('event_settings').select('*').single(),
      supabase.from('profiles').select('*') // Assumindo que operadores estão em profiles
    ]);

    if (parts.data) setParticipants(parts.data);
    if (cats.data) setCategories(cats.data);
    if (settings.data) setEventSettings(settings.data);
    if (ops.data) {
      setOperators(ops.data.map((o: any) => ({
        id: o.id,
        username: o.username || o.first_name || 'Operador',
        role: 'operator'
      })));
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    if (username === 'Adm' && password === 'adm4321') {
      const user: User = { id: 'admin-0', username: 'Adm', role: 'admin' };
      setCurrentUser(user);
      toast.success("Bem-vindo, Administrador");
      return true;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@orion.com`,
      password: password,
    });

    if (error) {
      toast.error("Usuário ou senha incorretos");
      return false;
    }

    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const addParticipant = async (p: Omit<Participant, 'id' | 'status'>) => {
    const { data, error } = await supabase.from('participants').insert([{ ...p, status: 'ausente' }]).select();
    if (error) {
      toast.error("Erro ao adicionar participante: " + error.message);
      return;
    }
    setParticipants([...participants, data[0]]);
    toast.success("Participante adicionado");
  };

  const updateParticipant = async (id: string, p: Partial<Participant>) => {
    const { error } = await supabase.from('participants').update(p).eq('id', id);
    if (error) {
      toast.error("Erro ao atualizar: " + error.message);
      return;
    }
    setParticipants(participants.map(part => part.id === id ? { ...part, ...p } : part));
    toast.success("Dados atualizados");
  };

  const deleteParticipant = async (id: string) => {
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (error) {
      toast.error("Erro ao remover: " + error.message);
      return;
    }
    setParticipants(participants.filter(p => p.id !== id));
    toast.success("Participante removido");
  };

  const bulkDeleteParticipants = async (ids: string[]) => {
    const { error } = await supabase.from('participants').delete().in('id', ids);
    if (error) {
      toast.error("Erro na remoção em massa");
      return;
    }
    setParticipants(participants.filter(p => !ids.includes(p.id)));
    toast.success(`${ids.length} participantes removidos`);
  };

  const bulkCheckinParticipants = async (ids: string[]) => {
    const now = new Date().toISOString();
    const { error } = await supabase.from('participants')
      .update({ status: 'presente', checkin_time: now, operator_id: currentUser?.id })
      .in('id', ids)
      .eq('status', 'ausente');

    if (error) {
      toast.error("Erro no check-in em massa");
      return;
    }
    
    setParticipants(participants.map(p => 
      ids.includes(p.id) && p.status === 'ausente'
        ? { ...p, status: 'presente', checkin_time: now, operator_id: currentUser?.id }
        : p
    ));
    toast.success(`Check-in realizado para ${ids.length} participantes`);
  };

  const performCheckin = async (participantId: string) => {
    const now = new Date().toISOString();
    const { error } = await supabase.from('participants')
      .update({ status: 'presente', checkin_time: now, operator_id: currentUser?.id })
      .eq('id', participantId);

    if (error) {
      toast.error("Erro no check-in");
      return;
    }

    setParticipants(participants.map(p => 
      p.id === participantId 
        ? { ...p, status: 'presente', checkin_time: now, operator_id: currentUser?.id } 
        : p
    ));
  };

  const addCategory = async (c: Omit<Category, 'id'>) => {
    const { data, error } = await supabase.from('categories').insert([c]).select();
    if (error) {
      toast.error("Erro ao criar categoria");
      return;
    }
    setCategories([...categories, data[0]]);
    toast.success("Categoria criada");
    return data[0].id;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast.error("Erro ao remover categoria (verifique se há participantes nela)");
      return;
    }
    setCategories(categories.filter(c => c.id !== id));
    toast.success("Categoria removida");
  };

  const addOperator = async (username: string, pass: string) => {
    // Nota: Em um sistema real, você usaria supabase.auth.signUp
    // Aqui estamos apenas simulando a adição para a UI
    const newOp: User = { id: Math.random().toString(), username, role: 'operator' };
    setOperators([...operators, newOp]);
    toast.success("Operador criado (Simulação)");
  };

  const deleteOperator = async (id: string) => {
    setOperators(operators.filter(o => o.id !== id));
    toast.success("Operador removido");
  };

  const updateSettings = async (s: EventSettings) => {
    const { error } = await supabase.from('event_settings').update(s).eq('id', (eventSettings as any).id);
    if (error) {
      toast.error("Erro ao salvar configurações");
      return;
    }
    setEventSettings(s);
    toast.success("Configurações salvas");
  };

  const importParticipants = async (data: any[]) => {
    let success = 0;
    const errors: string[] = [];
    const toInsert: any[] = [];

    for (const [index, row] of data.entries()) {
      const { nome, email, cpf, categoria, mesa } = row;
      
      if (!nome || !cpf || !mesa) {
        errors.push(`Linha ${index + 1}: Campos obrigatórios ausentes`);
        continue;
      }

      const mesaNum = parseInt(mesa);
      let catId = categories.find(c => c.name.toLowerCase() === categoria?.trim().toLowerCase())?.id;
      
      toInsert.push({
        name: nome.trim(),
        email: email?.trim() || '',
        cpf: cpf.trim(),
        category_id: catId || null,
        table: mesaNum,
        status: 'ausente'
      });
    }

    if (toInsert.length > 0) {
      const { data: inserted, error } = await supabase.from('participants').insert(toInsert).select();
      if (error) {
        errors.push("Erro na inserção em massa: " + error.message);
      } else {
        success = inserted.length;
        setParticipants([...participants, ...inserted]);
      }
    }

    return { success, errors };
  };

  return (
    <StoreContext.Provider value={{ 
      currentUser, participants, categories, operators, eventSettings, login, logout, 
      addParticipant, updateParticipant, deleteParticipant, bulkDeleteParticipants, bulkCheckinParticipants,
      performCheckin, addCategory, deleteCategory, addOperator, deleteOperator, updateSettings, importParticipants 
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};