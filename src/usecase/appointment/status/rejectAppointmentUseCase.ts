import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import ValidationError from "@/model/errors/validationError";
import { assertNonEmpty } from "@/usecase/utils/validationUtils";
import { IRejectAppointmentUseCase } from "@/usecase/appointment/status/iRejectAppointmentUseCase";
import Appointment from "@/model/entities/appointment";

export default class RejectAppointmentUseCase implements IRejectAppointmentUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async rejectAppointment(appointmentId: string): Promise<Appointment> {
        await this.prepareRejection(appointmentId);
        await this.appointmentRepository.updateStatus(appointmentId, 'rejected');
        return this.getUpdatedOrThrow(appointmentId);
    }

    async prepareRejection(appointmentId: string): Promise<void> {
        this.assertValidId(appointmentId);

        const appointment = await this.getAppointmentOrThrow(appointmentId);
        this.assertPending(appointment);
    }

    private assertValidId(appointmentId: string): void {
        assertNonEmpty(appointmentId, 'ID da consulta é obrigatório.');
    }

    private async getAppointmentOrThrow(appointmentId: string): Promise<Appointment> {
        const appointment = await this.appointmentRepository.getById(appointmentId);
        if (!appointment) {
            throw new ValidationError('Consulta não encontrada.');
        }
        return appointment;
    }

    private assertPending(appointment: Appointment): void {
        if (appointment.status !== 'pending') {
            throw new ValidationError('Apenas consultas pendentes podem ser recusadas.');
        }
    }

    private async getUpdatedOrThrow(appointmentId: string): Promise<Appointment> {
        const updatedAppointment = await this.appointmentRepository.getById(appointmentId);
        if (!updatedAppointment) {
            throw new ValidationError('Erro ao recuperar consulta atualizada.');
        }
        return updatedAppointment;
    }
}
