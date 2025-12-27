import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { formatDateToISO } from "@/model/utils/timeSlotUtils";
import { AgendaByDate, IListNutritionistAgendaUseCase } from "@/usecase/appointment/list/iListNutritionistAgendaUseCase";
import { assertNonEmpty, assertValidRange } from "@/usecase/utils/validationUtils";

export default class ListNutritionistAgendaUseCase implements IListNutritionistAgendaUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async listAgenda(
        nutritionistId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<AgendaByDate[]> {
        this.assertNutritionistId(nutritionistId);

        const start = startDate || new Date();
        const end = endDate || new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
        this.assertValidRange(start, end);

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

    async listAcceptedByDate(nutritionistId: string, date: Date): Promise<Appointment[]> {
        this.assertNutritionistId(nutritionistId);

        const dateStr = formatDateToISO(date);

        const allAppointments = await this.appointmentRepository.listByDate(dateStr, nutritionistId);

        return allAppointments
            .filter(appt => appt.status === 'accepted')
            .sort((a, b) => a.timeStart.localeCompare(b.timeStart));
    }

    private assertNutritionistId(nutritionistId: string): void {
        assertNonEmpty(nutritionistId, 'Nutricionista inválida.');
    }

    private assertValidRange(startDate: Date, endDate: Date): void {
        assertValidRange(startDate, endDate, 'Intervalo de datas inválido.');
    }
}
