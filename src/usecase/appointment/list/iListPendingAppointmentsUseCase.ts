import Appointment from "@/model/entities/appointment";

export interface IListPendingAppointmentsUseCase {
    listPendingByNutritionist(nutritionistId: string): Promise<Appointment[]>;
    subscribePendingByNutritionist(
        nutritionistId: string,
        callback: (appointments: Appointment[]) => void
    ): () => void;
}
