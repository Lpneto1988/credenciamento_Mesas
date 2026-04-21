export type UserRole = 'admin' | 'operator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  cpf: string;
  categoryId: string;
  table: number;
  status: 'presente' | 'ausente';
  checkinTime?: string;
  operatorId?: string;
}

export interface EventSettings {
  name: string;
  date: string;
  location: string;
  totalTables: number;
}