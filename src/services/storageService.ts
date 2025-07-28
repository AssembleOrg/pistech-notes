import type { Note, Project, ClientCharge, PartnerPayment } from '../types';

const STORAGE_KEYS = {
  NOTES: 'pistech_notes',
  PROJECTS: 'pistech_projects',
  CLIENT_CHARGES: 'pistech_client_charges',
  PARTNER_PAYMENTS: 'pistech_partner_payments',
};

class StorageService {
  private getItem<T>(key: string): T[] {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return [];
    }
  }

  private setItem<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error);
    }
  }

  // Notes
  getNotes(): Note[] {
    const notes = this.getItem<Note>(STORAGE_KEYS.NOTES);
    return notes.map(note => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    }));
  }

  saveNotes(notes: Note[]): void {
    this.setItem(STORAGE_KEYS.NOTES, notes);
  }

  // Projects
  getProjects(): Project[] {
    const projects = this.getItem<Project>(STORAGE_KEYS.PROJECTS);
    return projects.map(project => ({
      ...project,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
    }));
  }

  saveProjects(projects: Project[]): void {
    this.setItem(STORAGE_KEYS.PROJECTS, projects);
  }

  // Client Charges
  getClientCharges(): ClientCharge[] {
    const charges = this.getItem<ClientCharge>(STORAGE_KEYS.CLIENT_CHARGES);
    return charges.map(charge => ({
      ...charge,
      date: new Date(charge.date),
      createdAt: new Date(charge.createdAt),
      updatedAt: new Date(charge.updatedAt),
    }));
  }

  saveClientCharges(charges: ClientCharge[]): void {
    this.setItem(STORAGE_KEYS.CLIENT_CHARGES, charges);
  }

  // Partner Payments
  getPartnerPayments(): PartnerPayment[] {
    const payments = this.getItem<PartnerPayment>(STORAGE_KEYS.PARTNER_PAYMENTS);
    return payments.map(payment => ({
      ...payment,
      date: new Date(payment.date),
      createdAt: new Date(payment.createdAt),
      updatedAt: new Date(payment.updatedAt),
    }));
  }

  savePartnerPayments(payments: PartnerPayment[]): void {
    this.setItem(STORAGE_KEYS.PARTNER_PAYMENTS, payments);
  }

  // Clear all data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const storageService = new StorageService(); 