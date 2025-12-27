import Appointment from "@/model/entities/appointment";

export interface AgendaByDate {
    date: string;
    appointments: Appointment[];
}

export interface IListNutritionistAgendaUseCase {
    listAgenda(
        nutritionistId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<AgendaByDate[]>;
    listAcceptedByDate(nutritionistId: string, date: Date): Promise<Appointment[]>;
}
