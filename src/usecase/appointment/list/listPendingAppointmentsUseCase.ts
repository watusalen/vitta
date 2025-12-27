import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { IListPendingAppointmentsUseCase } from "@/usecase/appointment/list/iListPendingAppointmentsUseCase";
import { assertNonEmpty } from "@/usecase/utils/validationUtils";

export default class ListPendingAppointmentsUseCase implements IListPendingAppointmentsUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async listPendingByNutritionist(nutritionistId: string): Promise<Appointment[]> {
        this.assertNutritionistId(nutritionistId);

        const pendingAppointments = await this.appointmentRepository.listByStatus(
            'pending',
            nutritionistId
        );

        return pendingAppointments.sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) {
                return dateCompare;
            }
            return a.timeStart.localeCompare(b.timeStart);
        });
    }

    subscribePendingByNutritionist(
        nutritionistId: string,
        callback: (appointments: Appointment[]) => void
    ): () => void {
        this.assertNutritionistId(nutritionistId);
        return this.appointmentRepository.onNutritionistPendingChange(nutritionistId, callback);
    }

    private assertNutritionistId(nutritionistId: string): void {
        assertNonEmpty(nutritionistId, 'Nutricionista inválida.');
    }
}
