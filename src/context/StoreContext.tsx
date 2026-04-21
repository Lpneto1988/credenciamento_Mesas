"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Participant, Category, UserRole, EventSettings } from '@/types';
import { toast } from 'sonner';

interface StoreContextType {
  currentUser: User | null;
  operators: User[];
  participants: Participant[];
  categories: Category[];
  eventSettings: EventSettings;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addOperator: (username: string, password: string) => void;
  deleteOperator: (id: string) => void;
  addParticipant: (p: Omit<Participant, 'id' | 'status'>) => void;
  updateParticipant: (id: string, p: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  bulkDeleteParticipants: (ids: string[]) => void;
  bulkCheckinParticipants: (ids: string[]) => void;
  performCheckin: (participantId: string) => void;
  addCategory: (c: Omit<Category, 'id'>) => string;
  deleteCategory: (id: string) => void;
  updateSettings: (s: EventSettings) => void;
  importParticipants: (data: any[]) => { success: number; errors: string[] };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [operators, setOperators] = useState<User[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'VIP', color: '#ef4444' },
    { id: '2', name: 'Imprensa', color: '#3b82f6' },
    { id: '3', name: 'Cliente', color: '#10b981' },
  ]);
  const [eventSettings, setEventSettings] = useState<EventSettings>({
    name: 'Orion Event Experience',
    date: new Date().toISOString().split('T')[0],
    location: 'Centro de Convenções Orion',
    totalTables: 20,
    capacityPerTable: 10
  });

  useEffect(() => {
    const savedParticipants = localStorage.getItem('event_participants');
    const savedCategories = localStorage.getItem('event_categories');
    const savedUser = localStorage.getItem('event_user');
    const savedSettings = localStorage.getItem('event_settings');
    const savedOperators = localStorage.getItem('event_operators');

    if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedSettings) setEventSettings(JSON.parse(savedSettings));
    if (savedOperators) setOperators(JSON.parse(savedOperators));
  }, []);

  useEffect(() => {
    localStorage.setItem('event_participants', JSON.stringify(participants));
    localStorage.setItem('event_categories', JSON.stringify(categories));
    localStorage.setItem('event_settings', JSON.stringify(eventSettings));
    localStorage.setItem('event_operators', JSON.stringify(operators));
  }, [participants, categories, eventSettings, operators]);

  const login = (username: string, password: string): boolean => {
    // Admin fixo
    if (username === 'Adm' && password === 'adm4321') {
      const user: User = { id: 'admin-0', username: 'Adm', role: 'admin' };
      setCurrentUser(user);
      localStorage.setItem('event_user', JSON.stringify(user));
      toast.success("Bem-vindo, Administrador");
      return true;
    }

    // Busca nos operadores criados
    const operator = operators.find(op => op.username === username && op.password === password);
    if (operator) {
      const { password: _, ...userWithoutPass } = operator;
      setCurrentUser(userWithoutPass as User);
      localStorage.setItem('event_user', JSON.stringify(userWithoutPass));
      toast.success(`Bem-vindo, ${username}`);
      return true;
    }

    toast.error("Usuário ou senha incorretos");
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('event_user');
  };

  const addOperator = (username: string, password: string) => {
    if (username === 'Adm' || operators.some(op => op.username === username)) {
      toast.error("Este nome de usuário já existe");
      return;
    }
    const newOp: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      password,
      role: 'operator'
    };
    setOperators([...operators, newOp]);
    toast.success("Operador criado com sucesso");
  };

  const deleteOperator = (id: string) => {
    setOperators(operators.filter(op => op.id !== id));
    toast.success("Operador removido");
  };

  const addParticipant = (p: Omit<Participant, 'id' | 'status'>) => {
    if (participants.some(part => part.cpf === p.cpf)) {
      toast.error("CPF já cadastrado");
      return;
    }
    const newParticipant: Participant = {
      ...p,
      id: Math.random().toString(36).substr(2, 9),
      status: 'ausente'
    };
    setParticipants([...participants, newParticipant]);
    toast.success("Participante adicionado");
  };

  const updateParticipant = (id: string, p: Partial<Participant>) => {
    setParticipants(participants.map(part => part.id === id ? { ...part, ...p } : part));
    toast.success("Dados atualizados");
  };

  const deleteParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
    toast.success("Participante removido");
  };

  const bulkDeleteParticipants = (ids: string[]) => {
    setParticipants(participants.filter(p => !ids.includes(p.id)));
    toast.success(`${ids.length} participantes removidos`);
  };

  const bulkCheckinParticipants = (ids: string[]) => {
    const now = new Date().toISOString();
    setParticipants(participants.map(p => 
      ids.includes(p.id) && p.status === 'ausente'
        ? { ...p, status: 'presente', checkinTime: now, operatorId: currentUser?.id }
        : p
    ));
    toast.success(`Check-in realizado para ${ids.length} participantes`);
  };

  const performCheckin = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;
    
    setParticipants(participants.map(p => 
      p.id === participantId 
        ? { ...p, status: 'presente', checkinTime: new Date().toISOString(), operatorId: currentUser?.id } 
        : p
    ));
  };

  const addCategory = (c: Omit<Category, 'id'>) => {
    const existing = categories.find(cat => cat.name.toLowerCase() === c.name.toLowerCase());
    if (existing) return existing.id;

    const newId = Math.random().toString(36).substr(2, 9);
    setCategories([...categories, { ...c, id: newId }]);
    toast.success("Categoria criada");
    return newId;
  };

  const deleteCategory = (id: string) => {
    if (participants.some(p => p.categoryId === id)) {
      toast.error("Não é possível excluir: existem participantes nesta categoria");
      return;
    }
    setCategories(categories.filter(c => c.id !== id));
    toast.success("Categoria removida");
  };

  const updateSettings = (s: EventSettings) => {
    setEventSettings(s);
    toast.success("Configurações salvas");
  };

  const importParticipants = (data: any[]) => {
    let success = 0;
    const errors: string[] = [];
    const newParticipants = [...participants];
    const currentCategories = [...categories];

    data.forEach((row, index) => {
      const { nome, email, cpf, categoria, mesa } = row;
      
      if (!nome || !cpf || !mesa) {
        errors.push(`Linha ${index + 1}: Campos obrigatórios ausentes (nome, cpf, mesa)`);
        return;
      }

      if (newParticipants.some(p => p.cpf === cpf)) {
        errors.push(`Linha ${index + 1}: CPF ${cpf} já existe no sistema`);
        return;
      }

      const mesaNum = parseInt(mesa);
      if (isNaN(mesaNum) || mesaNum < 1 || mesaNum > eventSettings.totalTables) {
        errors.push(`Linha ${index + 1}: Mesa ${mesa} inválida (deve ser entre 1 e ${eventSettings.totalTables})`);
        return;
      }

      let catId = currentCategories.find(c => c.name.toLowerCase() === categoria?.trim().toLowerCase())?.id;
      if (!catId && categoria) {
        catId = Math.random().toString(36).substr(2, 9);
        currentCategories.push({ id: catId, name: categoria.trim(), color: '#94a3b8' });
      }

      newParticipants.push({
        id: Math.random().toString(36).substr(2, 9),
        name: nome.trim(),
        email: email?.trim() || '',
        cpf: cpf.trim(),
        categoryId: catId || '3',
        table: mesaNum,
        status: 'ausente'
      });
      success++;
    });

    setParticipants(newParticipants);
    setCategories(currentCategories);
    return { success, errors };
  };

  return (
    <StoreContext.Provider value={{ 
      currentUser, operators, participants, categories, eventSettings, login, logout, 
      addOperator, deleteOperator,
      addParticipant, updateParticipant, deleteParticipant, bulkDeleteParticipants, bulkCheckinParticipants,
      performCheckin, addCategory, deleteCategory, updateSettings, importParticipants 
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