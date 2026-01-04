import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { CalendarEventInput, ICalendarService } from "@/model/services/iCalendarService";
import { IAppointmentCalendarSyncUseCase, CalendarOwner } from "@/usecase/calendar/iAppointmentCalendarSyncUseCase";

type CalendarField = "calendarEventIdPatient" | "calendarEventIdNutritionist";

export default class AppointmentCalendarSyncUseCase implements IAppointmentCalendarSyncUseCase {
    constructor(
        private calendarService: ICalendarService,
        private appointmentRepository: IAppointmentRepository
    ) {}

    async syncAccepted(appointment: Appointment, owner: CalendarOwner): Promise<void> {
        const field = this.getCalendarField(owner);
        const currentEventId = appointment[field];

        const input = this.buildEventInput(appointment);
        if (currentEventId) {
            await this.calendarService.updateEvent(currentEventId, input);
            return;
        }

        const eventId = await this.calendarService.createEvent(input);

        await this.appointmentRepository.updateCalendarEventIds(appointment.id, {
            [field]: eventId,
        });
    }

    async syncCancelledOrRejected(appointment: Appointment, owner: CalendarOwner): Promise<void> {
        const field = this.getCalendarField(owner);
        const currentEventId = appointment[field];
        if (!currentEventId) {
            return;
        }

        await this.calendarService.removeEvent(currentEventId);
        await this.appointmentRepository.updateCalendarEventIds(appointment.id, {
            [field]: null,
        });
    }

    private getCalendarField(owner: CalendarOwner): CalendarField {
        return owner === "patient" ? "calendarEventIdPatient" : "calendarEventIdNutritionist";
    }

    private buildEventInput(appointment: Appointment): CalendarEventInput {
        const startDate = this.toIsoDateTime(appointment.date, appointment.timeStart);
        const endDate = this.toIsoDateTime(appointment.date, appointment.timeEnd);
        const formattedDate = this.formatDate(appointment.date);

        return {
            title: `Consulta Vitta - ${appointment.timeStart}`,
            startDate,
            endDate,
            notes: `Consulta confirmada para ${formattedDate} às ${appointment.timeStart}.`,
            reminderMinutesBefore: [1440],
        };
    }

    private toIsoDateTime(date: string, time: string): string {
        const [year, month, day] = date.split("-").map(Number);
        const [hours, minutes] = time.split(":").map(Number);
        const local = new Date(year, (month ?? 1) - 1, day, hours ?? 0, minutes ?? 0, 0, 0);
        return local.toISOString();
    }

    private formatDate(date: string): string {
        const [year, month, day] = date.split("-");
        if (!day || !month || !year) {
            return date;
        }
        return `${day}/${month}/${year}`;
    }
}
