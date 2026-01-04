import Appointment from "@/model/entities/appointment";

export interface IListAppointmentConflictsUseCase {
    listConflictsBySlot(
        nutritionistId: string,
        date: string,
        timeStart: string,
        timeEnd: string
    ): Promise<Appointment[]>;
}
