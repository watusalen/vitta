import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";

export interface IListPendingAppointmentsUseCase {
    execute(nutritionistId: string): Promise<Appointment[]>;
}

export default class ListPendingAppointmentsUseCase implements IListPendingAppointmentsUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(nutritionistId: string): Promise<Appointment[]> {
        const pendingAppointments = await this.appointmentRepository.listByStatus(
            'pending',
            nutritionistId
        );

        return pendingAppointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.timeStart}`);
            const dateB = new Date(`${b.date}T${b.timeStart}`);
            return dateA.getTime() - dateB.getTime();
        });
    }
}
