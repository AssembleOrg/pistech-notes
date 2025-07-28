import type {
  Note,
  Project,
  ClientCharge,
  PartnerPayment,
  Partner,
  Log,
  PaginatedResponse,
  NoteFilters,
  ProjectFilters,
  ClientChargeFilters,
  PartnerPaymentFilters,
  PartnerFilters,
  LogFilters,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let fetchHeaders = headers;
    if (this.token) {
      fetchHeaders = { ...headers, Authorization: `Bearer ${this.token}` };
    }

    const config: RequestInit = {
      ...options,
      headers: fetchHeaders,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (response.status === 401 || response.status === 403) {
        // Auto logout on authentication errors
        this.logout();
        throw new Error('Authentication failed. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses (like 204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      const data = await response.json();
      return this.convertDates(data);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Helper method to build query parameters
  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Helper method to convert date strings to Date objects
  private convertDates<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(item => this.convertDates(item)) as T;
      }
      
      const converted = { ...obj } as any;
      for (const [key, value] of Object.entries(obj as any)) {
        if (typeof value === 'string' && (key === 'createdAt' || key === 'updatedAt' || key === 'deletedAt' || key === 'date')) {
          converted[key] = new Date(value);
        } else if (typeof value === 'object' && value !== null) {
          converted[key] = this.convertDates(value);
        }
      }
      return converted;
    }
    
    return obj;
  }

  // Auth methods
  async validateToken(token: string): Promise<boolean> {
    const response = await this.request<AuthResponse>(`/auth/validate-token`, {
      method: 'POST',
      body: JSON.stringify({token}),
    });
    return response.access_token !== null;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.access_token;
    localStorage.setItem('auth_token', response.access_token);
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.token = response.access_token;
    localStorage.setItem('auth_token', response.access_token);
    return response;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Notes API
  async getNotes(filters?: NoteFilters): Promise<Note[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    return this.request<Note[]>(`/notes?${params.toString()}`);
  }

  async getNotesPaginated(filters: NoteFilters = {}): Promise<PaginatedResponse<Note>> {
    const queryParams = this.buildQueryParams({
      ...filters,
      page: filters.page || 1,
      limit: filters.limit || 10,
    });
    
    return this.request<PaginatedResponse<Note>>(`/notes/paginated${queryParams}`, {
      method: 'GET',
    });
  }

  async getNote(id: string): Promise<Note> {
    return this.request<Note>(`/notes/${id}`);
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Note> {
    return this.request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async updateNote(id: string, note: Partial<Note>): Promise<Note> {
    return this.request<Note>(`/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(note),
    });
  }

  async deleteNote(id: string): Promise<void> {
    return this.request<void>(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  async hardDeleteNote(id: string): Promise<void> {
    return this.request<void>(`/notes/${id}/hard`, {
      method: 'DELETE',
    });
  }

  async restoreNote(id: string): Promise<Note> {
    return this.request<Note>(`/notes/${id}/restore`, {
      method: 'PATCH',
    });
  }

  // Projects API
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    return this.request<Project[]>(`/projects?${params.toString()}`);
  }

  async getProjectsPaginated(filters: ProjectFilters = {}): Promise<PaginatedResponse<Project>> {
    const queryParams = this.buildQueryParams({
      ...filters,
      page: filters.page || 1,
      limit: filters.limit || 10,
    });
    
    return this.request<PaginatedResponse<Project>>(`/projects/paginated${queryParams}`, {
      method: 'GET',
    });
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async getProjectWithCharges(id: string): Promise<Project & {
    clientCharges: ClientCharge[];
    partnerPayments: PartnerPayment[];
    totalClientCharges: number;
    totalPartnerPayments: number;
    netAmount: number;
  }> {
    return this.request<Project & {
      clientCharges: ClientCharge[];
      partnerPayments: PartnerPayment[];
      totalClientCharges: number;
      totalPartnerPayments: number;
      netAmount: number;
    }>(`/projects/${id}/with-charges`);
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async hardDeleteProject(id: string): Promise<void> {
    return this.request<void>(`/projects/${id}/hard`, {
      method: 'DELETE',
    });
  }

  async restoreProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}/restore`, {
      method: 'PATCH',
    });
  }

  // Client Charges API
  async getClientCharges(filters?: ClientChargeFilters): Promise<ClientCharge[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    return this.request<ClientCharge[]>(`/client-charges?${params.toString()}`);
  }

  async getClientChargesPaginated(filters: ClientChargeFilters = {}): Promise<PaginatedResponse<ClientCharge>> {
    const queryParams = this.buildQueryParams({
      ...filters,
      page: filters.page || 1,
      limit: filters.limit || 10,
    });
    
    return this.request<PaginatedResponse<ClientCharge>>(`/client-charges/paginated${queryParams}`, {
      method: 'GET',
    });
  }

  async getClientChargesByProject(projectId: string): Promise<ClientCharge[]> {
    return this.request<ClientCharge[]>(`/client-charges/project/${projectId}`);
  }

  async getClientCharge(id: string): Promise<ClientCharge> {
    return this.request<ClientCharge>(`/client-charges/${id}`);
  }

  async createClientCharge(charge: Omit<ClientCharge, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<ClientCharge> {
    return this.request<ClientCharge>('/client-charges', {
      method: 'POST',
      body: JSON.stringify(charge),
    });
  }

  async updateClientCharge(id: string, charge: Partial<ClientCharge>): Promise<ClientCharge> {
    return this.request<ClientCharge>(`/client-charges/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(charge),
    });
  }

  async deleteClientCharge(id: string): Promise<void> {
    return this.request<void>(`/client-charges/${id}`, {
      method: 'DELETE',
    });
  }

  async hardDeleteClientCharge(id: string): Promise<void> {
    return this.request<void>(`/client-charges/${id}/hard`, {
      method: 'DELETE',
    });
  }

  async restoreClientCharge(id: string): Promise<ClientCharge> {
    return this.request<ClientCharge>(`/client-charges/${id}/restore`, {
      method: 'PATCH',
    });
  }

  // Partner Payments API
  async getPartnerPayments(filters?: PartnerPaymentFilters): Promise<PartnerPayment[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    return this.request<PartnerPayment[]>(`/partner-payments?${params.toString()}`);
  }

  async getPartnerPaymentsPaginated(filters: PartnerPaymentFilters = {}): Promise<PaginatedResponse<PartnerPayment>> {
    const queryParams = this.buildQueryParams({
      ...filters,
      page: filters.page || 1,
      limit: filters.limit || 10,
    });
    
    return this.request<PaginatedResponse<PartnerPayment>>(`/partner-payments/paginated${queryParams}`, {
      method: 'GET',
    });
  }

  async getPartnerPaymentsByProject(projectId: string): Promise<PartnerPayment[]> {
    return this.request<PartnerPayment[]>(`/partner-payments/project/${projectId}`);
  }

  async getPartnerPayment(id: string): Promise<PartnerPayment> {
    return this.request<PartnerPayment>(`/partner-payments/${id}`);
  }

  async createPartnerPayment(payment: Omit<PartnerPayment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<PartnerPayment> {
    return this.request<PartnerPayment>('/partner-payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async updatePartnerPayment(id: string, payment: Partial<PartnerPayment>): Promise<PartnerPayment> {
    return this.request<PartnerPayment>(`/partner-payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payment),
    });
  }

  async deletePartnerPayment(id: string): Promise<void> {
    return this.request<void>(`/partner-payments/${id}`, {
      method: 'DELETE',
    });
  }

  async hardDeletePartnerPayment(id: string): Promise<void> {
    return this.request<void>(`/partner-payments/${id}/hard`, {
      method: 'DELETE',
    });
  }

  async restorePartnerPayment(id: string): Promise<PartnerPayment> {
    return this.request<PartnerPayment>(`/partner-payments/${id}/restore`, {
      method: 'PATCH',
    });
  }

  // Partners API
  async getPartners(filters?: PartnerFilters): Promise<Partner[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    return this.request<Partner[]>(`/partners?${params.toString()}`);
  }

  async getPartnersPaginated(filters: PartnerFilters = {}): Promise<PaginatedResponse<Partner>> {
    const queryParams = this.buildQueryParams({
      ...filters,
      page: filters.page || 1,
      limit: filters.limit || 10,
    });
    
    return this.request<PaginatedResponse<Partner>>(`/partners/paginated${queryParams}`, {
      method: 'GET',
    });
  }

  async getPartner(id: string): Promise<Partner> {
    return this.request<Partner>(`/partners/${id}`);
  }

  async createPartner(partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Partner> {
    return this.request<Partner>('/partners', {
      method: 'POST',
      body: JSON.stringify(partner),
    });
  }

  async updatePartner(id: string, partner: Partial<Partner>): Promise<Partner> {
    return this.request<Partner>(`/partners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(partner),
    });
  }

  async deletePartner(id: string): Promise<void> {
    return this.request<void>(`/partners/${id}`, {
      method: 'DELETE',
    });
  }

  async hardDeletePartner(id: string): Promise<void> {
    return this.request<void>(`/partners/${id}/hard`, {
      method: 'DELETE',
    });
  }

  async restorePartner(id: string): Promise<Partner> {
    return this.request<Partner>(`/partners/${id}/restore`, {
      method: 'PATCH',
    });
  }

  // Logs API
  async getLogs(filters?: LogFilters): Promise<Log[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    return this.request<Log[]>(`/logs?${params.toString()}`);
  }

  async getLog(id: string): Promise<Log> {
    return this.request<Log>(`/logs/${id}`);
  }

  async getLogsByEntity(entityId: string): Promise<Log[]> {
    return this.request<Log[]>(`/logs/entity/${entityId}`);
  }

  async getLogsByUser(userId: string): Promise<Log[]> {
    return this.request<Log[]>(`/logs/user/${userId}`);
  }

  async getLogsByType(entityType: string): Promise<Log[]> {
    return this.request<Log[]>(`/logs/type/${entityType}`);
  }
}

export const apiService = new ApiService(); 