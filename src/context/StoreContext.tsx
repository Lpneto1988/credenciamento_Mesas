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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Tenta carregar o usuário do sessionStorage ao iniciar
    if (typeof window !== 'undefined') {
      const savedUser = sessionStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });
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
    const initializeUser = async () => {
      // 1. Tenta carregar o usuário do sessionStorage
      const savedUserString = sessionStorage.getItem('currentUser');
      if (savedUserString) {
        const savedUser = JSON.parse(savedUserString);

        // 2. Busca os dados mais recentes desse usuário no banco para garantir consistência
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', savedUser.id)
          .single();

        if (userData && !error) {
          // 3. Atualiza o estado e o sessionStorage com os dados frescos
          const freshUser = { id: userData.id, nome: userData.nome, role: userData.role };
          setCurrentUser(freshUser);
          sessionStorage.setItem('currentUser', JSON.stringify(freshUser));
        } else {
          // Se não encontrar o usuário no DB (ex: foi deletado), limpa a sessão
          sessionStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      }
    };

    initializeUser();
    fetchData();

    // Listener para atualizações em tempo real
    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_settings' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

    const login = async (username: string, pass: string) => {
    // 1. Buscar usuário pelo nome na tabela 'usuarios'
    const { data: userData, error: queryError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('nome', username.trim())
      .single();

    if (queryError || !userData) {
      console.error("[Login Error]", "Usuário não encontrado.");
      toast.error("Usuário ou senha incorretos.");
      return false;
    }

    // 2. Comparar a senha (em texto plano, como solicitado)
    if (userData.senha === pass) {
      // 3. Se a senha estiver correta, definir o usuário na aplicação e na sessão
      const userToSave = {
        id: userData.id,
        nome: userData.nome,
        role: userData.role,
      };
      setCurrentUser(userToSave);
      sessionStorage.setItem('currentUser', JSON.stringify(userToSave));

      toast.success(`Bem-vindo, ${userData.nome}!`);
      return true;
    } else {
      // 4. Se a senha estiver incorreta
      toast.error("Usuário ou senha incorretos.");
      return false;
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    toast.info("Você saiu do sistema.");
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
    fetchData();
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
    fetchData();
  };

  const deleteParticipant = async (id: string) => {
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (error) throw error;
    toast.success("Removido!");
    fetchData();
  };

  const importParticipants = async (data: any[]) => {
    let success = 0;
    const errors: string[] = [];
    const participantsToInsert: any[] = [];

    data.forEach((row, index) => {
      // Validação: Apenas nome e categoria são obrigatórios na importação
      if (!row.name || !row.category) {
        errors.push(`Linha ${index + 2}: Faltam dados obrigatórios (Nome, Categoria)`);
        return;
      }

      participantsToInsert.push({
        name: row.name,
        cpf: row.cpf || null, // CPF agora é opcional
        category_id: row.category,
        table: row.table || null,
        status: 'ausente'
      });
    });

    if (participantsToInsert.length > 0) {
      const { error } = await supabase.from('participants').insert(participantsToInsert);

      if (error) {
        errors.push(`Erro no banco de dados: ${error.message}`);
        toast.error("Ocorreu um erro ao salvar os dados.");
      } else {
        success = participantsToInsert.length;
        toast.success(`${success} participantes importados com sucesso!`);
        fetchData(); // Atualiza a lista
      }
    }

    return { success, errors };
  };

  const addCategory = async (name: string, color: string) => {
    const { error } = await supabase.from('categories').insert([{ name, color }]);
    if (error) throw error;
    toast.success("Categoria criada!");
    fetchData();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    toast.success("Categoria removida!");
    fetchData();
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
    if (!username.trim() || !pass) {
      toast.error("Usuário e senha são obrigatórios.");
      throw new Error("Usuário e senha são obrigatórios.");
    }

    try {
      const { error } = await supabase.from('usuarios').insert([
        {
          nome: username.trim(),
          senha: pass, // Salvar a senha em texto plano
          role: 'operador'
        }
      ]);

      if (error) {
        // Trata erro de usuário duplicado
        if (error.code === '23505') {
          toast.error(`O nome de usuário "${username}" já existe.`);
        } else {
          throw error;
        }
      } else {
        toast.success(`Operador ${username} criado com sucesso!`);
        // O listener de tempo real já vai atualizar a lista, mas podemos forçar se necessário.
        // fetchData();
      }
    } catch (error: any) {
      console.error("Erro ao criar operador:", error);
      if (!error.message.includes('já existe')) {
          toast.error(error.message || "Erro desconhecido ao criar operador.");
      }
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
    fetchData();
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
    fetchData();
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