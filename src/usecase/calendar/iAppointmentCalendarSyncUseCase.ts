import Appointment from "@/model/entities/appointment";

export type CalendarOwner = "patient" | "nutritionist";

export interface IAppointmentCalendarSyncUseCase {
    syncAccepted(appointment: Appointment, owner: CalendarOwner): Promise<void>;
    syncCancelledOrRejected(appointment: Appointment, owner: CalendarOwner): Promise<void>;
}
