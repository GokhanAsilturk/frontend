import { format, parseISO, isValid, differenceInDays, addDays, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { DATE_FORMATS } from './constants';

export const formatDate = (date: string | Date, formatString: string = DATE_FORMATS.DISPLAY): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return '-';
    }
    return format(dateObj, formatString, { locale: tr });
  } catch {
    return '-';
  }
};

export const formatDateWithTime = (date: string | Date): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
};

export const formatDateForAPI = (date: Date): string => {
  return format(date, DATE_FORMATS.API);
};

export const formatDateTimeForAPI = (date: Date): string => {
  return format(date, DATE_FORMATS.API_WITH_TIME);
};

export const parseApiDate = (dateString: string): Date | null => {
  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

export const isDateInPast = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) && differenceInDays(new Date(), dateObj) > 0;
};

export const isDateInFuture = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) && differenceInDays(dateObj, new Date()) > 0;
};

export const getDaysDifference = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  if (!isValid(start) || !isValid(end)) {
    return 0;
  }
  
  return differenceInDays(end, start);
};

export const addDaysToDate = (date: string | Date, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
};

export const subtractDaysFromDate = (date: string | Date, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return subDays(dateObj, days);
};

export const getDateRangeText = (startDate: string, endDate: string): string => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const days = getDaysDifference(startDate, endDate);
  
  return `${start} - ${end} (${days} gün)`;
};
