export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getCurrentDate = (): Date => {
  return new Date();
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseDateFromInput = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

export const validateAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
}; 