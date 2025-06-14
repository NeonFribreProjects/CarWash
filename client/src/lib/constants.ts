export const CATEGORIES = ['Car Wash Packages', 'Detailing Services', 'Premium Services'];

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday', 
  'Tuesday', 
  'Wednesday', 
  'Thursday', 
  'Friday', 
  'Saturday'
] as const;

export type DayName = typeof DAYS_OF_WEEK[number];

export const getDayName = (date: Date): DayName => {
  return DAYS_OF_WEEK[date.getDay()];
};

export const getDayIndex = (date: Date): number => {
  return date.getDay();
};

export const validateDayIndex = (index: number): boolean => {
  return index >= 0 && index <= 6;
};

export const normalizeDayIndex = (index: number): number => {
  return ((index % 7) + 7) % 7;
}; 