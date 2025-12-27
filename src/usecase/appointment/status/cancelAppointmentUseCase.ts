import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import ValidationError from "@/model/errors/validationError";
import { assertNonEmpty } from "@/usecase/utils/validationUtils";
import { ICancelAppointmentUseCase } from "@/usecase/appointment/status/iCancelAppointmentUseCase";
import Appointment from "@/model/entities/appointment";

export default class CancelAppointmentUseCase implements ICancelAppointmentUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async cancelAppointment(appointmentId: string): Promise<Appointment> {
        await this.prepareCancel(appointmentId);
        await this.appointmentRepository.updateStatus(appointmentId, 'cancelled');
        return this.getUpdatedOrThrow(appointmentId);
    }

    async prepareCancel(appointmentId: string): Promise<void> {
        this.assertValidId(appointmentId);

        const appointment = await this.getAppointmentOrThrow(appointmentId);
        this.assertCancelable(appointment);
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

    private assertCancelable(appointment: Appointment): void {
        if (appointment.status !== 'accepted' && appointment.status !== 'pending') {
            throw new ValidationError('Apenas consultas pendentes ou aceitas podem ser canceladas.');
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
