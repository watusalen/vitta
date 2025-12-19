import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { makeAppointment } from "@/model/factories/makeAppointment";
import { isWeekday, AVAILABLE_TIME_SLOTS, formatDateToISO } from "@/model/factories/makeTimeSlot";
import ValidationError from "@/model/errors/validationError";

export interface RequestAppointmentInput {
    patientId: string;
    nutritionistId: string;
    date: Date;
    timeStart: string;
    timeEnd: string;
    observations?: string;
}

export interface IRequestAppointmentUseCase {
    execute(input: RequestAppointmentInput): Promise<Appointment>;
}

export default class RequestAppointmentUseCase implements IRequestAppointmentUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(input: RequestAppointmentInput): Promise<Appointment> {
        if (!isWeekday(input.date)) {
            throw new ValidationError('Consultas só podem ser agendadas de segunda a sexta-feira.');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(input.date);
        inputDate.setHours(0, 0, 0, 0);

        if (inputDate < today) {
            throw new ValidationError('Não é possível agendar consultas em datas passadas.');
        }

        const isValidSlot = AVAILABLE_TIME_SLOTS.some(
            slot => slot.timeStart === input.timeStart && slot.timeEnd === input.timeEnd
        );

        if (!isValidSlot) {
            throw new ValidationError('Horário selecionado não está disponível.');
        }

        const dateStr = formatDateToISO(input.date);
        const isOccupied = await this.isSlotOccupied(
            dateStr,
            input.timeStart,
            input.timeEnd,
            input.nutritionistId
        );

        if (isOccupied) {
            throw new ValidationError('Este horário já está ocupado. Por favor, escolha outro.');
        }

        const hasPendingRequest = await this.patientHasPendingRequest(
            input.patientId,
            dateStr,
            input.timeStart,
            input.timeEnd
        );

        if (hasPendingRequest) {
            throw new ValidationError('Você já tem uma solicitação pendente para este horário.');
        }

        const appointment = makeAppointment({
            patientId: input.patientId,
            nutritionistId: input.nutritionistId,
            date: dateStr,
            timeStart: input.timeStart,
            timeEnd: input.timeEnd,
            observations: input.observations,
        });

        await this.appointmentRepository.create(appointment);

        return appointment;
    }

    private async isSlotOccupied(
        date: string,
        timeStart: string,
        timeEnd: string,
        nutritionistId: string
    ): Promise<boolean> {
        const appointments = await this.appointmentRepository.listByDate(date, nutritionistId);

        return appointments.some(
            appt =>
                appt.status === 'accepted' &&
                appt.timeStart === timeStart &&
                appt.timeEnd === timeEnd
        );
    }

    private async patientHasPendingRequest(
        patientId: string,
        date: string,
        timeStart: string,
        timeEnd: string
    ): Promise<boolean> {
        const patientAppointments = await this.appointmentRepository.listByPatient(patientId);

        return patientAppointments.some(
            appt =>
                appt.status === 'pending' &&
                appt.date === date &&
                appt.timeStart === timeStart &&
                appt.timeEnd === timeEnd
        );
    }
}
