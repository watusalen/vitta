import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import ValidationError from "@/model/errors/validationError";

export interface IAcceptAppointmentUseCase {
    execute(appointmentId: string): Promise<Appointment>;
}

export default class AcceptAppointmentUseCase implements IAcceptAppointmentUseCase {
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
            throw new ValidationError('Apenas consultas pendentes podem ser aceitas.');
        }

        const existingAppointments = await this.appointmentRepository.listByDate(
            appointment.date,
            appointment.nutritionistId
        );

        const hasConflict = existingAppointments.some(
            appt =>
                appt.id !== appointmentId &&
                appt.status === 'accepted' &&
                appt.timeStart === appointment.timeStart &&
                appt.timeEnd === appointment.timeEnd
        );

        if (hasConflict) {
            throw new ValidationError('Já existe uma consulta aceita neste horário.');
        }

        const conflictingPending = existingAppointments.filter(
            appt =>
                appt.id !== appointmentId &&
                appt.status === 'pending' &&
                appt.timeStart === appointment.timeStart &&
                appt.timeEnd === appointment.timeEnd
        );

        for (const conflicting of conflictingPending) {
            await this.appointmentRepository.updateStatus(conflicting.id, 'cancelled');
        }

        await this.appointmentRepository.updateStatus(appointmentId, 'accepted');

        const updatedAppointment = await this.appointmentRepository.getById(appointmentId);
        
        if (!updatedAppointment) {
            throw new ValidationError('Erro ao recuperar consulta atualizada.');
        }

        return updatedAppointment;
    }
}
