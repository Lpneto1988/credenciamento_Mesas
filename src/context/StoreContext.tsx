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
    name: 'Orion Event',
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
      supabase.from('profiles').select('*')
    ]);

    if (parts.data) {
      setParticipants(parts.data.map((p: any) => ({
        ...p,
        categoryId: p.category_id,
        checkinTime: p.checkin_time,
        operatorId: p.operator_id
      })));
    }
    
    if (cats.data) setCategories(cats.data);
    
    if (settings.data) {
      setEventSettings({
        name: settings.data.name,
        date: settings.data.date || '',
        location: settings.data.location || '',
        totalTables: settings.data.total_tables || 20,
        capacityPerTable: settings.data.capacity_per_table || 10
      });
    }

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
    const { data, error } = await supabase.from('participants').insert([{ 
      name: p.name,
      email: p.email,
      cpf: p.cpf,
      category_id: p.categoryId,
      table: p.table,
      status: 'ausente' 
    }]).select();
    
    if (error) {
      toast.error("Erro ao adicionar: " + error.message);
      return;
    }
    
    const newPart = { ...data[0], categoryId: data[0].category_id };
    setParticipants([...participants, newPart]);
    toast.success("Participante adicionado");
  };

  const updateParticipant = async (id: string, p: Partial<Participant>) => {
    const updateData: any = { ...p };
    if (p.categoryId) {
      updateData.category_id = p.categoryId;
      delete updateData.categoryId;
    }

    const { error } = await supabase.from('participants').update(updateData).eq('id', id);
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
        ? { ...p, status: 'presente', checkinTime: now, operatorId: currentUser?.id }
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
        ? { ...p, status: 'presente', checkinTime: now, operatorId: currentUser?.id } 
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
      toast.error("Erro ao remover categoria");
      return;
    }
    setCategories(categories.filter(c => c.id !== id));
    toast.success("Categoria removida");
  };

  const addOperator = async (username: string, pass: string) => {
    const newOp: User = { id: Math.random().toString(), username, role: 'operator' };
    setOperators([...operators, newOp]);
    toast.success("Operador criado (Simulação)");
  };

  const deleteOperator = async (id: string) => {
    setOperators(operators.filter(o => o.id !== id));
    toast.success("Operador removido");
  };

  const updateSettings = async (s: EventSettings) => {
    const updateData = {
      name: s.name,
      date: s.date,
      location: s.location,
      total_tables: s.totalTables,
      capacity_per_table: s.capacityPerTable
    };

    const { error } = await supabase.from('event_settings').update(updateData).eq('id', (eventSettings as any).id);
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
        errors.push("Erro na inserção: " + error.message);
      } else {
        success = inserted.length;
        const mapped = inserted.map((p: any) => ({ ...p, categoryId: p.category_id }));
        setParticipants([...participants, ...mapped]);
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