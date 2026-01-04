import Appointment from "@/model/entities/appointment";
import ValidationError from "@/model/errors/validationError";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { assertNonEmpty } from "@/usecase/utils/validationUtils";
import { IReactivateAppointmentUseCase } from "@/usecase/appointment/status/iReactivateAppointmentUseCase";

export default class ReactivateAppointmentUseCase implements IReactivateAppointmentUseCase {
    constructor(private appointmentRepository: IAppointmentRepository) { }

    async reactivateAppointment(appointmentId: string): Promise<Appointment> {
        this.assertValidId(appointmentId);

        const appointment = await this.getAppointmentOrThrow(appointmentId);

        if (appointment.status !== "cancelled") {
            throw new ValidationError("Apenas consultas canceladas podem ser reativadas.");
        }

        const hasConflict = await this.hasAcceptedConflict(appointment);
        if (hasConflict) {
            throw new ValidationError(
                "Já existe uma consulta aceita neste horário. Resolva o conflito para continuar."
            );
        }

        await this.appointmentRepository.updateStatus(appointment.id, "accepted");
        return this.getAppointmentOrThrow(appointment.id);
    }

    private assertValidId(appointmentId: string): void {
        assertNonEmpty(appointmentId, "ID da consulta é obrigatório.");
    }

    private async getAppointmentOrThrow(appointmentId: string): Promise<Appointment> {
        const appointment = await this.appointmentRepository.getById(appointmentId);
        if (!appointment) {
            throw new ValidationError("Consulta não encontrada.");
        }
        return appointment;
    }

    private async hasAcceptedConflict(appointment: Appointment): Promise<boolean> {
        const sameDay = await this.appointmentRepository.listByDate(
            appointment.date,
            appointment.nutritionistId
        );

        return sameDay.some(
            appt =>
                appt.id !== appointment.id &&
                appt.status === "accepted" &&
                appt.timeStart === appointment.timeStart &&
                appt.timeEnd === appointment.timeEnd
        );
    }
}
