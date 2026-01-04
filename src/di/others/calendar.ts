import CalendarService from "@/infra/calendar/calendarService";
import CalendarPermissionUseCase from "@/usecase/calendar/calendarPermissionUseCase";
import AppointmentCalendarSyncUseCase from "@/usecase/calendar/appointmentCalendarSyncUseCase";
import { getAppointmentRepository } from "@/di/others/base";

let calendarService: CalendarService | null = null;
let calendarPermissionUseCase: CalendarPermissionUseCase | null = null;
let appointmentCalendarSyncUseCase: AppointmentCalendarSyncUseCase | null = null;

export function getCalendarService() {
    if (!calendarService) {
        calendarService = new CalendarService();
    }
    return calendarService;
}

export function getCalendarPermissionUseCase() {
    if (!calendarPermissionUseCase) {
        calendarPermissionUseCase = new CalendarPermissionUseCase(getCalendarService());
    }
    return calendarPermissionUseCase;
}

export function getAppointmentCalendarSyncUseCase() {
    if (!appointmentCalendarSyncUseCase) {
        appointmentCalendarSyncUseCase = new AppointmentCalendarSyncUseCase(
            getCalendarService(),
            getAppointmentRepository()
        );
    }
    return appointmentCalendarSyncUseCase;
}
