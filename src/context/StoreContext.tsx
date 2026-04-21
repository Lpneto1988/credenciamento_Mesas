"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Participant, Category, UserRole, EventSettings } from '@/types';
import { toast } from 'sonner';

interface StoreContextType {
  currentUser: User | null;
  participants: Participant[];
  categories: Category[];
  eventSettings: EventSettings;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  addParticipant: (p: Omit<Participant, 'id' | 'status'>) => void;
  updateParticipant: (id: string, p: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  performCheckin: (participantId: string) => void;
  addCategory: (c: Omit<Category, 'id'>) => string;
  deleteCategory: (id: string) => void;
  updateSettings: (s: EventSettings) => void;
  importParticipants: (data: any[]) => { success: number; errors: string[] };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'VIP', color: '#ef4444' },
    { id: '2', name: 'Imprensa', color: '#3b82f6' },
    { id: '3', name: 'Cliente', color: '#10b981' },
  ]);
  const [eventSettings, setEventSettings] = useState<EventSettings>({
    name: 'Meu Grande Evento',
    date: new Date().toISOString().split('T')[0],
    location: 'Centro de Convenções',
    totalTables: 20
  });

  useEffect(() => {
    const savedParticipants = localStorage.getItem('event_participants');
    const savedCategories = localStorage.getItem('event_categories');
    const savedUser = localStorage.getItem('event_user');
    const savedSettings = localStorage.getItem('event_settings');

    if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedSettings) setEventSettings(JSON.parse(savedSettings));
  }, []);

  useEffect(() => {
    localStorage.setItem('event_participants', JSON.stringify(participants));
    localStorage.setItem('event_categories', JSON.stringify(categories));
    localStorage.setItem('event_settings', JSON.stringify(eventSettings));
  }, [participants, categories, eventSettings]);

  const login = (email: string, role: UserRole) => {
    const user = { id: Math.random().toString(), name: email.split('@')[0], email, role };
    setCurrentUser(user);
    localStorage.setItem('event_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('event_user');
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
      currentUser, participants, categories, eventSettings, login, logout, 
      addParticipant, updateParticipant, deleteParticipant, 
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