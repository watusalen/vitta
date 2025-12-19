import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import ValidationError from "@/model/errors/validationError";

export interface IRejectAppointmentUseCase {
    execute(appointmentId: string): Promise<Appointment>;
}

export default class RejectAppointmentUseCase implements IRejectAppointmentUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(appointmentId: string): Promise<Appointment> {
        const appointment = await this.appointmentRepository.getById(appointmentId);

        if (!appointment) {
            throw new ValidationError('Consulta não encontrada.');
        }

        if (appointment.status !== 'pending') {
            throw new ValidationError('Apenas consultas pendentes podem ser recusadas.');
        }

        await this.appointmentRepository.updateStatus(appointmentId, 'rejected');

        const updatedAppointment = await this.appointmentRepository.getById(appointmentId);
        
        if (!updatedAppointment) {
            throw new ValidationError('Erro ao recuperar consulta atualizada.');
        }

        return updatedAppointment;
    }
}
