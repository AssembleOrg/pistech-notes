export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled' | 'pending';
  amount: number;
  currency: 'ARS' | 'USD' | 'EUR';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ClientCharge {
  id: string;
  projectId: string;
  amount: number;
  currency: 'ARS' | 'USD' | 'EUR';
  date: Date;
  paymentMethod: 'cash' | 'transfer' | 'card' | 'check' | 'other';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface PartnerPayment {
  id: string;
  projectId: string;
  partnerName: string;
  amount: number;
  currency: 'ARS' | 'USD' | 'EUR';
  date: Date;
  paymentMethod: 'cash' | 'transfer' | 'card' | 'check' | 'other';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Partner {
  id: string;
  fullName: string;
  nickname: string;
  number: string;
  partnerRole: 'owner' | 'collaborator';
  pistechRole: 'developer' | 'designer' | 'manager' | 'rrhh' | 'accountant' | 'marketing' | 'sales' | 'other';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Log {
  id: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'Note' | 'Project' | 'ClientCharge' | 'PartnerPayment' | 'Partner' | 'User';
  entityId: string;
  oldData?: any;
  newData?: any;
  changes?: string[];
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ProjectWithCharges extends Project {
  clientCharges: ClientCharge[];
  partnerPayments: PartnerPayment[];
  totalClientCharges: number;
  totalPartnerPayments: number;
  netAmount: number;
}

// Pagination types
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Filter types
export interface BaseFilters {
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}

export interface NoteFilters extends BaseFilters {
  title?: string;
  content?: string;
  tags?: string;
}

export interface ProjectFilters extends BaseFilters {
  name?: string;
  description?: string;
  status?: Project['status'];
}

export interface ClientChargeFilters extends BaseFilters {
  projectId?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: Currency;
  paymentMethod?: PaymentMethod;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface PartnerPaymentFilters extends BaseFilters {
  projectId?: string;
  partnerName?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: Currency;
  paymentMethod?: PaymentMethod;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface PartnerFilters extends BaseFilters {
  fullName?: string;
  nickname?: string;
  partnerRole?: Partner['partnerRole'];
  pistechRole?: Partner['pistechRole'];
}

export interface LogFilters extends BaseFilters {
  userId?: string;
  action?: Log['action'];
  entityType?: Log['entityType'];
  entityId?: string;
  startDate?: string;
  endDate?: string;
}

// Type aliases
export type Currency = 'ARS' | 'USD' | 'EUR';
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'check' | 'other';
export type ProjectStatus = 'active' | 'completed' | 'on-hold' | 'cancelled' | 'pending';
export type PartnerRole = 'owner' | 'collaborator';
export type PistechRole = 'developer' | 'designer' | 'manager' | 'rrhh' | 'accountant' | 'marketing' | 'sales' | 'other';
export type LogAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type EntityType = 'Note' | 'Project' | 'ClientCharge' | 'PartnerPayment' | 'Partner' | 'User';

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
} 