import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import ValidationError from "@/model/errors/validationError";
import { assertNonEmpty } from "@/usecase/utils/validationUtils";
import { IAcceptAppointmentUseCase } from "@/usecase/appointment/status/iAcceptAppointmentUseCase";
import CheckAppointmentConflictUseCase from "@/usecase/appointment/status/checkAppointmentConflictUseCase";
import { ICheckAppointmentConflictUseCase } from "@/usecase/appointment/status/iCheckAppointmentConflictUseCase";
import Appointment from "@/model/entities/appointment";

export default class AcceptAppointmentUseCase implements IAcceptAppointmentUseCase {
    private appointmentRepository: IAppointmentRepository;
    private checkAppointmentConflictUseCase: ICheckAppointmentConflictUseCase;

    constructor(
        appointmentRepository: IAppointmentRepository,
        checkAppointmentConflictUseCase?: ICheckAppointmentConflictUseCase
    ) {
        this.appointmentRepository = appointmentRepository;
        this.checkAppointmentConflictUseCase =
            checkAppointmentConflictUseCase ?? new CheckAppointmentConflictUseCase(appointmentRepository);
    }

    async acceptAppointment(appointmentId: string): Promise<Appointment> {
        await this.prepareAcceptance(appointmentId);
        await this.appointmentRepository.updateStatus(appointmentId, 'accepted');
        await this.rejectCompetingPending(appointmentId);
        return this.getUpdatedOrThrow(appointmentId);
    }

    async prepareAcceptance(appointmentId: string): Promise<void> {
        this.assertValidId(appointmentId);

        const appointment = await this.getAppointmentOrThrow(appointmentId);
        this.assertPending(appointment);
        await this.ensureNoConflict(appointment);
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
            throw new ValidationError('Apenas consultas pendentes podem ser aceitas.');
        }
    }

    private async ensureNoConflict(appointment: Appointment): Promise<void> {
        const hasConflict = await this.checkAppointmentConflictUseCase.hasConflict({
            date: appointment.date,
            timeStart: appointment.timeStart,
            timeEnd: appointment.timeEnd,
            nutritionistId: appointment.nutritionistId,
            excludeAppointmentId: appointment.id,
        });

        if (hasConflict) {
            throw new ValidationError('Já existe uma consulta aceita neste horário.');
        }
    }

    private async rejectCompetingPending(appointmentId: string): Promise<void> {
        const appointment = await this.getAppointmentOrThrow(appointmentId);
        const sameDay = await this.appointmentRepository.listByDate(
            appointment.date,
            appointment.nutritionistId
        );

        const toReject = sameDay.filter(
            appt =>
                appt.id !== appointment.id &&
                appt.status === 'pending' &&
                appt.timeStart === appointment.timeStart &&
                appt.timeEnd === appointment.timeEnd
        );

        await Promise.all(
            toReject.map(appt => this.appointmentRepository.updateStatus(appt.id, 'rejected'))
        );
    }

    private async getUpdatedOrThrow(appointmentId: string): Promise<Appointment> {
        const updatedAppointment = await this.appointmentRepository.getById(appointmentId);
        if (!updatedAppointment) {
            throw new ValidationError('Erro ao recuperar consulta atualizada.');
        }
        return updatedAppointment;
    }
}
