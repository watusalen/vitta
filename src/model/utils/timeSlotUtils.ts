export const AVAILABLE_TIME_SLOTS = [
    { timeStart: '09:00', timeEnd: '11:00' },
    { timeStart: '11:00', timeEnd: '13:00' },
    { timeStart: '13:00', timeEnd: '15:00' },
    { timeStart: '14:00', timeEnd: '16:00' },
] as const;

export const AVAILABLE_WEEKDAYS = [1, 2, 3, 4, 5] as const;

export function isWeekday(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return AVAILABLE_WEEKDAYS.includes(dayOfWeek as 1 | 2 | 3 | 4 | 5);
}

export function formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
