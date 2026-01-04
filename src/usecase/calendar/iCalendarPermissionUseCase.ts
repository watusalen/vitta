import { CalendarPermissionStatus } from "@/model/services/iCalendarService";

export interface ICalendarPermissionUseCase {
    checkPermission(): Promise<CalendarPermissionStatus>;
    requestPermission(): Promise<CalendarPermissionStatus>;
    openSettings(): Promise<void>;
}
