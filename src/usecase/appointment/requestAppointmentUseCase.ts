import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { makeAppointment } from "@/model/factories/makeAppointment";
import { isWeekday, AVAILABLE_TIME_SLOTS, formatDateToISO } from "@/model/factories/makeTimeSlot";
import ValidationError from "@/model/errors/validationError";

/**
 * Input para solicitar uma consulta
 */
export interface RequestAppointmentInput {
    patientId: string;
    nutritionistId: string;
    date: Date;
    timeStart: string;
    timeEnd: string;
    observations?: string;
}

/**
 * Interface para o caso de uso de solicitar consulta
 */
export interface IRequestAppointmentUseCase {
    /**
     * Solicita uma nova consulta
     * @param input - Dados da solicitação
     * @returns Appointment criado com status 'pending'
     */
    execute(input: RequestAppointmentInput): Promise<Appointment>;
}

/**
 * Caso de uso para solicitar uma consulta
 * 
 * Regras de negócio:
 * - Data deve ser um dia útil (Segunda a Sexta)
 * - Horário deve ser um slot válido
 * - Data não pode ser no passado
 * - Slot não pode estar ocupado por consulta aceita
 * - Consulta é criada com status 'pending'
 */
export default class RequestAppointmentUseCase implements IRequestAppointmentUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(input: RequestAppointmentInput): Promise<Appointment> {
        // Validar data é dia útil
        if (!isWeekday(input.date)) {
            throw new ValidationError('Consultas só podem ser agendadas de segunda a sexta-feira.');
        }

        // Validar data não é no passado
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(input.date);
        inputDate.setHours(0, 0, 0, 0);

        if (inputDate < today) {
            throw new ValidationError('Não é possível agendar consultas em datas passadas.');
        }

        // Validar slot de horário é válido
        const isValidSlot = AVAILABLE_TIME_SLOTS.some(
            slot => slot.timeStart === input.timeStart && slot.timeEnd === input.timeEnd
        );

        if (!isValidSlot) {
            throw new ValidationError('Horário selecionado não está disponível.');
        }

        // Verificar se slot já está ocupado por consulta aceita
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

        // Criar appointment
        const appointment = makeAppointment({
            patientId: input.patientId,
            nutritionistId: input.nutritionistId,
            date: dateStr,
            timeStart: input.timeStart,
            timeEnd: input.timeEnd,
            observations: input.observations,
        });

        // Persistir no repositório
        await this.appointmentRepository.create(appointment);

        return appointment;
    }

    /**
     * Verifica se um slot está ocupado por uma consulta aceita
     */
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
}
