export type UserRole = 'admin' | 'operador';

export interface User {
  id: string;
  nome: string;
  role: UserRole;
  senha?: string; // Opcional para o usuário logado por segurança
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  cpf: string;
  categoryId: string;
  table: number;
  status: 'presente' | 'ausente';
  checkinTime?: string;
  operatorId?: string;
}

export interface EventSettings {
  id?: string;
  name: string;
  date: string;
  location: string;
  totalTables: number;
  capacityPerTable: number;
}

export interface Operator {
  id: string;
  nome: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}