import type { Currency } from '../types';

export const formatCurrency = (amount: number, currency: Currency): string => {
  const formatters: Record<Currency, Intl.NumberFormat> = {
    ARS: new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    USD: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    EUR: new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  };

  return formatters[currency].format(amount);
};

export const formatDate = (date: Date | string | undefined | null): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return '-';
  const add3hours = new Date(d.getTime() + 3 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(add3hours);
};

export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return '-';
  return d.toLocaleString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const formatPaymentMethod = (method: string): string => {
  const methods: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    card: 'Tarjeta',
    check: 'Cheque',
    other: 'Otro',
  };
  return methods[method] || method;
};

export const formatProjectStatus = (status: string): string => {
  const statuses: Record<string, string> = {
    active: 'Activo',
    completed: 'Completado',
    'on-hold': 'En Pausa',
  };
  return statuses[status] || status;
}; 

// Helper functions for currency input handling
export const parseCurrencyInput = (value: string, currency: Currency): number => {
  // Remove currency symbols and other non-numeric characters
  let cleanValue = value;
  
  // Remove currency symbols
  cleanValue = cleanValue.replace(/[$€]/g, '');
  
  // Remove all non-numeric characters except decimal separators
  cleanValue = cleanValue.replace(/[^\d.,]/g, '');
  
  // Handle different decimal separators based on currency
  let numericValue: string;
  if (currency === 'USD') {
    // USD uses . as decimal separator
    numericValue = cleanValue.replace(/,/g, '');
  } else {
    // ARS and EUR use , as decimal separator
    numericValue = cleanValue.replace(/\./g, '').replace(',', '.');
  }
  
  const number = parseFloat(numericValue) || 0;
  return Math.round(number * 100) / 100; // Keep 2 decimal places
};

export const formatCurrencyForInput = (amount: number, currency: Currency): string => {
  if (amount === 0) return '';
  
  const formatters: Record<Currency, Intl.NumberFormat> = {
    ARS: new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    USD: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    EUR: new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  };

  return formatters[currency].format(amount);
};