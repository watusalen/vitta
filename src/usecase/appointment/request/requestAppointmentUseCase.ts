import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { makeAppointment } from "@/model/factories/makeAppointment";
import { formatDateToISO } from "@/model/utils/timeSlotUtils";
import ValidationError from "@/model/errors/validationError";
import { IRequestAppointmentUseCase, RequestAppointmentInput } from "@/usecase/appointment/request/iRequestAppointmentUseCase";
import Appointment from "@/model/entities/appointment";
import { assertSlotNotInPast, assertValidDate, assertValidIds, assertValidSlot, assertValidTimes } from "@/usecase/appointment/request/validator/requestAppointmentValidator";

export default class RequestAppointmentUseCase implements IRequestAppointmentUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async requestAppointment(input: RequestAppointmentInput): Promise<Appointment> {
        const appointment = await this.prepareRequest(input);
        await this.appointmentRepository.create(appointment);
        return appointment;
    }

    async prepareRequest(input: RequestAppointmentInput): Promise<Appointment> {
        assertValidIds(input);
        assertValidTimes(input);
        assertValidDate(input.date);
        assertSlotNotInPast(input.date, input.timeStart);
        assertValidSlot(input.timeStart, input.timeEnd);

        const dateStr = formatDateToISO(input.date);
        await this.assertNoPendingRequest(
            input.patientId,
            dateStr,
            input.timeStart,
            input.timeEnd
        );
        await this.assertSlotAvailable(
            dateStr,
            input.timeStart,
            input.timeEnd,
            input.nutritionistId
        );

        return makeAppointment({
            id: input.appointmentId,
            patientId: input.patientId,
            nutritionistId: input.nutritionistId,
            date: dateStr,
            timeStart: input.timeStart,
            timeEnd: input.timeEnd,
        });
    }

    private async assertSlotAvailable(
        date: string,
        timeStart: string,
        timeEnd: string,
        nutritionistId: string
    ): Promise<void> {
        const isOccupied = await this.isSlotOccupied(
            date,
            timeStart,
            timeEnd,
            nutritionistId
        );

        if (isOccupied) {
            throw new ValidationError('Este horário já está ocupado. Por favor, escolha outro.');
        }
    }

    private async assertNoPendingRequest(
        patientId: string,
        date: string,
        timeStart: string,
        timeEnd: string
    ): Promise<void> {
        const hasPendingRequest = await this.patientHasPendingRequest(
            patientId,
            date,
            timeStart,
            timeEnd
        );

        if (hasPendingRequest) {
            throw new ValidationError('Você já tem uma solicitação registrada para este horário.');
        }
    }

    private async isSlotOccupied(
        date: string,
        timeStart: string,
        timeEnd: string,
        nutritionistId: string
    ): Promise<boolean> {
        const appointments = await this.appointmentRepository.listByDate(date, nutritionistId);

        return appointments.some(appt => {
            if (appt.timeStart !== timeStart || appt.timeEnd !== timeEnd) {
                return false;
            }
            return appt.status === 'accepted';
        });
    }

    private async patientHasPendingRequest(
        patientId: string,
        date: string,
        timeStart: string,
        timeEnd: string
    ): Promise<boolean> {
        const patientAppointments = await this.appointmentRepository.listByPatient(patientId);
        const normalizeDate = (value: string): string => {
            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return value;
            }
            const parsed = new Date(value);
            if (Number.isNaN(parsed.getTime())) {
                return value;
            }
            return parsed.toISOString().split("T")[0];
        };

        const targetDate = normalizeDate(date);

        return patientAppointments.some(appt => {
            const appointmentDate = normalizeDate(appt.date);
            if (
                appointmentDate !== targetDate ||
                appt.timeStart !== timeStart ||
                appt.timeEnd !== timeEnd
            ) {
                return false;
            }
            return appt.status === "pending" || appt.status === "cancelled";
        });
    }
}
