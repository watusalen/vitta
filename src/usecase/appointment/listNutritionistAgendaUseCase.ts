import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { formatDateToISO } from "@/model/factories/makeTimeSlot";

export interface AgendaByDate {
    date: string;
    appointments: Appointment[];
}

export interface IListNutritionistAgendaUseCase {
    execute(
        nutritionistId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<AgendaByDate[]>;

    executeByDate(nutritionistId: string, date: Date): Promise<Appointment[]>;
}

export default class ListNutritionistAgendaUseCase implements IListNutritionistAgendaUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(
        nutritionistId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<AgendaByDate[]> {
        const start = startDate || new Date();
        const end = endDate || new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

        const startStr = formatDateToISO(start);
        const endStr = formatDateToISO(end);

        const appointments = await this.appointmentRepository.listAcceptedByDateRange(
            startStr,
            endStr,
            nutritionistId
        );

        const groupedByDate = new Map<string, Appointment[]>();

        for (const appt of appointments) {
            const existing = groupedByDate.get(appt.date) || [];
            existing.push(appt);
            groupedByDate.set(appt.date, existing);
        }

        const result: AgendaByDate[] = [];

        for (const [date, appts] of groupedByDate) {
            appts.sort((a, b) => a.timeStart.localeCompare(b.timeStart));
            result.push({ date, appointments: appts });
        }

        result.sort((a, b) => a.date.localeCompare(b.date));

        return result;
    }

    async executeByDate(nutritionistId: string, date: Date): Promise<Appointment[]> {
        const dateStr = formatDateToISO(date);

        const allAppointments = await this.appointmentRepository.listByDate(dateStr, nutritionistId);

        return allAppointments
            .filter(appt => appt.status === 'accepted')
            .sort((a, b) => a.timeStart.localeCompare(b.timeStart));
    }
}
