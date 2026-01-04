import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { assertNonEmpty } from "@/usecase/utils/validationUtils";
import { IListAppointmentConflictsUseCase } from "@/usecase/appointment/list/iListAppointmentConflictsUseCase";

export default class ListAppointmentConflictsUseCase implements IListAppointmentConflictsUseCase {
    constructor(private appointmentRepository: IAppointmentRepository) { }

    async listConflictsBySlot(
        nutritionistId: string,
        date: string,
        timeStart: string,
        timeEnd: string
    ): Promise<Appointment[]> {
        assertNonEmpty(nutritionistId, "Nutricionista inválida.");

        const sameDay = await this.appointmentRepository.listByDate(date, nutritionistId);

        return sameDay.filter(
            appt =>
                appt.timeStart === timeStart &&
                appt.timeEnd === timeEnd &&
                (appt.status === "accepted" || appt.status === "cancelled")
        );
    }
}
