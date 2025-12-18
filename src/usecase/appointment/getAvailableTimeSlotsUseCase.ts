import TimeSlot from "@/model/entities/timeSlot";
import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import {
    makeTimeSlot,
    AVAILABLE_TIME_SLOTS,
    isWeekday,
    formatDateToISO
} from "@/model/factories/makeTimeSlot";

/**
 * Interface para o caso de uso de obter slots de horário disponíveis
 */
export interface IGetAvailableTimeSlotsUseCase {
    /**
     * Obtém os slots de horário disponíveis para uma data específica
     * @param date - Data para verificar disponibilidade
     * @param nutritionistId - ID da nutricionista
     * @returns Lista de TimeSlots disponíveis
     */
    execute(date: Date, nutritionistId: string): Promise<TimeSlot[]>;

    /**
     * Obtém os slots de horário disponíveis para um intervalo de datas
     * @param startDate - Data inicial
     * @param endDate - Data final
     * @param nutritionistId - ID da nutricionista
     * @returns Mapa de data (YYYY-MM-DD) para lista de TimeSlots
     */
    executeForRange(
        startDate: Date,
        endDate: Date,
        nutritionistId: string
    ): Promise<Map<string, TimeSlot[]>>;

    /**
     * Verifica se uma data específica tem algum slot disponível
     * @param date - Data para verificar
     * @param nutritionistId - ID da nutricionista
     * @returns true se há pelo menos um slot disponível
     */
    hasAvailability(date: Date, nutritionistId: string): Promise<boolean>;
}

/**
 * Caso de uso para obter slots de horário disponíveis
 * 
 * Regras de negócio:
 * - Disponibilidade: Segunda a Sexta, 9h às 16h
 * - Slots de 2 horas: 9-11h, 11-13h, 13-15h, 14-16h
 * - Slots com consultas aceitas não são exibidos
 * - Fins de semana não são disponíveis
 */
export default class GetAvailableTimeSlotsUseCase implements IGetAvailableTimeSlotsUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(date: Date, nutritionistId: string): Promise<TimeSlot[]> {
        // Fins de semana não têm disponibilidade
        if (!isWeekday(date)) {
            return [];
        }

        const dateStr = formatDateToISO(date);

        // Buscar consultas aceitas para esta data
        const acceptedAppointments = await this.getAcceptedAppointmentsForDate(
            dateStr,
            nutritionistId
        );

        // Criar set de horários ocupados para busca rápida
        const occupiedSlots = new Set(
            acceptedAppointments.map(appt => `${appt.timeStart}-${appt.timeEnd}`)
        );

        // Gerar slots disponíveis
        const availableSlots: TimeSlot[] = [];

        for (const slotTemplate of AVAILABLE_TIME_SLOTS) {
            const slotKey = `${slotTemplate.timeStart}-${slotTemplate.timeEnd}`;
            const isOccupied = occupiedSlots.has(slotKey);

            if (!isOccupied) {
                availableSlots.push(
                    makeTimeSlot({
                        date: dateStr,
                        timeStart: slotTemplate.timeStart,
                        timeEnd: slotTemplate.timeEnd,
                        available: true,
                    })
                );
            }
        }

        return availableSlots;
    }

    async executeForRange(
        startDate: Date,
        endDate: Date,
        nutritionistId: string
    ): Promise<Map<string, TimeSlot[]>> {
        const result = new Map<string, TimeSlot[]>();

        const startStr = formatDateToISO(startDate);
        const endStr = formatDateToISO(endDate);

        // Buscar todas as consultas aceitas no período
        const acceptedAppointments = await this.appointmentRepository.listAcceptedByDateRange(
            startStr,
            endStr,
            nutritionistId
        );

        // Agrupar consultas por data
        const appointmentsByDate = new Map<string, Appointment[]>();
        for (const appt of acceptedAppointments) {
            const existing = appointmentsByDate.get(appt.date) || [];
            existing.push(appt);
            appointmentsByDate.set(appt.date, existing);
        }

        // Iterar cada dia do período
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            if (isWeekday(currentDate)) {
                const dateStr = formatDateToISO(currentDate);
                const dateAppointments = appointmentsByDate.get(dateStr) || [];

                const occupiedSlots = new Set(
                    dateAppointments.map(appt => `${appt.timeStart}-${appt.timeEnd}`)
                );

                const availableSlots: TimeSlot[] = [];
                for (const slotTemplate of AVAILABLE_TIME_SLOTS) {
                    const slotKey = `${slotTemplate.timeStart}-${slotTemplate.timeEnd}`;
                    if (!occupiedSlots.has(slotKey)) {
                        availableSlots.push(
                            makeTimeSlot({
                                date: dateStr,
                                timeStart: slotTemplate.timeStart,
                                timeEnd: slotTemplate.timeEnd,
                                available: true,
                            })
                        );
                    }
                }

                result.set(dateStr, availableSlots);
            }

            // Próximo dia
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return result;
    }

    async hasAvailability(date: Date, nutritionistId: string): Promise<boolean> {
        const slots = await this.execute(date, nutritionistId);
        return slots.length > 0;
    }

    /**
     * Busca consultas aceitas para uma data específica
     */
    private async getAcceptedAppointmentsForDate(
        date: string,
        nutritionistId: string
    ): Promise<Appointment[]> {
        const appointments = await this.appointmentRepository.listByDate(date, nutritionistId);
        return appointments.filter(appt => appt.status === 'accepted');
    }
}
