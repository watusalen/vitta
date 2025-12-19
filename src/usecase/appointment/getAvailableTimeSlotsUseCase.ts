import TimeSlot from "@/model/entities/timeSlot";
import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import {
    makeTimeSlot,
    AVAILABLE_TIME_SLOTS,
    isWeekday,
    formatDateToISO
} from "@/model/factories/makeTimeSlot";

export interface IGetAvailableTimeSlotsUseCase {
    execute(date: Date, nutritionistId: string): Promise<TimeSlot[]>;
    executeForRange(
        startDate: Date,
        endDate: Date,
        nutritionistId: string
    ): Promise<Map<string, TimeSlot[]>>;
    hasAvailability(date: Date, nutritionistId: string): Promise<boolean>;
}

export default class GetAvailableTimeSlotsUseCase implements IGetAvailableTimeSlotsUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(date: Date, nutritionistId: string): Promise<TimeSlot[]> {
        if (!isWeekday(date)) {
            return [];
        }

        const dateStr = formatDateToISO(date);

        const acceptedAppointments = await this.getAcceptedAppointmentsForDate(
            dateStr,
            nutritionistId
        );

        const occupiedSlots = new Set(
            acceptedAppointments.map(appt => `${appt.timeStart}-${appt.timeEnd}`)
        );

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

        const acceptedAppointments = await this.appointmentRepository.listAcceptedByDateRange(
            startStr,
            endStr,
            nutritionistId
        );

        const appointmentsByDate = new Map<string, Appointment[]>();
        for (const appt of acceptedAppointments) {
            const existing = appointmentsByDate.get(appt.date) || [];
            existing.push(appt);
            appointmentsByDate.set(appt.date, existing);
        }

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

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return result;
    }

    async hasAvailability(date: Date, nutritionistId: string): Promise<boolean> {
        const slots = await this.execute(date, nutritionistId);
        return slots.length > 0;
    }

    private async getAcceptedAppointmentsForDate(
        date: string,
        nutritionistId: string
    ): Promise<Appointment[]> {
        const appointments = await this.appointmentRepository.listByDate(date, nutritionistId);
        return appointments.filter(appt => appt.status === 'accepted');
    }
}
