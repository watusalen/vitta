export type CalendarPermissionStatus = "authorized" | "denied" | "restricted" | "undetermined";

export type CalendarEventInput = {
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    notes?: string;
    reminderMinutesBefore?: number[];
};

export interface ICalendarService {
    checkPermissions(): Promise<CalendarPermissionStatus>;
    requestPermissions(): Promise<CalendarPermissionStatus>;
    openSettings(): Promise<void>;
    createEvent(input: CalendarEventInput): Promise<string>;
    updateEvent(eventId: string, input: CalendarEventInput): Promise<string>;
    removeEvent(eventId: string): Promise<void>;
}
