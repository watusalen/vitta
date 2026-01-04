import Appointment from "@/model/entities/appointment";
import ValidationError from "@/model/errors/validationError";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { assertNonEmpty } from "@/usecase/utils/validationUtils";
import { IResolveAppointmentConflictUseCase } from "@/usecase/appointment/status/iResolveAppointmentConflictUseCase";

export default class ResolveAppointmentConflictUseCase implements IResolveAppointmentConflictUseCase {
    constructor(private appointmentRepository: IAppointmentRepository) { }

    async resolveConflict(appointmentId: string): Promise<Appointment> {
        this.assertValidId(appointmentId);

        const appointment = await this.getAppointmentOrThrow(appointmentId);

        if (appointment.status !== "cancelled" && appointment.status !== "accepted") {
            throw new ValidationError("Apenas consultas canceladas ou aceitas podem ser reativadas.");
        }

        const sameSlot = await this.getSameSlotAppointments(appointment);

        const acceptedOthers = sameSlot.filter(
            appt => appt.id !== appointment.id && appt.status === "accepted"
        );

        await Promise.all(
            acceptedOthers.map(appt => this.appointmentRepository.updateStatus(appt.id, "cancelled"))
        );

        if (appointment.status !== "accepted") {
            await this.appointmentRepository.updateStatus(appointment.id, "accepted");
        }

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

    private async getSameSlotAppointments(appointment: Appointment): Promise<Appointment[]> {
        const sameDay = await this.appointmentRepository.listByDate(
            appointment.date,
            appointment.nutritionistId
        );

        return sameDay.filter(
            appt =>
                appt.timeStart === appointment.timeStart &&
                appt.timeEnd === appointment.timeEnd &&
                (appt.status === "accepted" || appt.status === "cancelled")
        );
    }
}
