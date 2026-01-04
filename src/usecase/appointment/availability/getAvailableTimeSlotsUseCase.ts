import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { makeTimeSlot } from "@/model/factories/makeTimeSlot";
import {
    AVAILABLE_TIME_SLOTS,
    isWeekday,
    formatDateToISO
} from "@/model/utils/timeSlotUtils";
import { IGetAvailableTimeSlotsUseCase } from "@/usecase/appointment/availability/iGetAvailableTimeSlotsUseCase";
import TimeSlot from "@/model/entities/timeSlot";
import { assertNonEmpty, assertValidRange } from "@/usecase/utils/validationUtils";

export default class GetAvailableTimeSlotsUseCase implements IGetAvailableTimeSlotsUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async listAvailableSlots(
        date: Date,
        nutritionistId: string,
        patientId?: string
    ): Promise<TimeSlot[]> {
        this.assertNutritionistId(nutritionistId);

        if (!isWeekday(date)) {
            return [];
        }

        if (this.isDateInPast(date)) {
            return [];
        }

        const dateStr = formatDateToISO(date);

        const acceptedAppointments = await this.getAcceptedAppointmentsForDate(
            dateStr,
            nutritionistId
        );
        const patientBlockedSlots = await this.getPatientBlockedSlots(dateStr, patientId);

        const occupiedSlots = new Set(
            acceptedAppointments.map(appt => `${appt.timeStart}-${appt.timeEnd}`)
        );

        const availableSlots: TimeSlot[] = [];

        for (const slotTemplate of AVAILABLE_TIME_SLOTS) {
            const slotKey = `${slotTemplate.timeStart}-${slotTemplate.timeEnd}`;
            const isOccupied = occupiedSlots.has(slotKey);

            if (
                !isOccupied &&
                !patientBlockedSlots.has(slotKey) &&
                !this.isSlotInPast(date, slotTemplate.timeStart)
            ) {
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

    async listAvailableSlotsForRange(
        startDate: Date,
        endDate: Date,
        nutritionistId: string,
        patientId?: string
    ): Promise<Map<string, TimeSlot[]>> {
        this.assertNutritionistId(nutritionistId);
        this.assertValidRange(startDate, endDate);

        const result = new Map<string, TimeSlot[]>();

        const startStr = formatDateToISO(startDate);
        const endStr = formatDateToISO(endDate);

        const acceptedAppointments = await this.appointmentRepository.listAcceptedByDateRange(
            startStr,
            endStr,
            nutritionistId
        );
        const patientAppointments = patientId
            ? await this.appointmentRepository.listByPatient(patientId)
            : [];

        const appointmentsByDate = new Map<string, Appointment[]>();
        for (const appt of acceptedAppointments) {
            const existing = appointmentsByDate.get(appt.date) || [];
            existing.push(appt);
            appointmentsByDate.set(appt.date, existing);
        }

        const patientBlockedByDate = new Map<string, Set<string>>();
        for (const appt of patientAppointments) {
            if (!this.isBlockedForPatient(appt.status)) {
                continue;
            }
            if (appt.date < startStr || appt.date > endStr) {
                continue;
            }
            const slotKey = `${appt.timeStart}-${appt.timeEnd}`;
            const existing = patientBlockedByDate.get(appt.date) || new Set<string>();
            existing.add(slotKey);
            patientBlockedByDate.set(appt.date, existing);
        }

        const currentDate = new Date(startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        while (currentDate <= endDate) {
            if (isWeekday(currentDate) && currentDate >= today) {
                const dateStr = formatDateToISO(currentDate);
                const dateAppointments = appointmentsByDate.get(dateStr) || [];
                const patientBlockedSlots = patientBlockedByDate.get(dateStr) || new Set<string>();

                const occupiedSlots = new Set(
                    dateAppointments.map(appt => `${appt.timeStart}-${appt.timeEnd}`)
                );

                const availableSlots: TimeSlot[] = [];
                for (const slotTemplate of AVAILABLE_TIME_SLOTS) {
                    const slotKey = `${slotTemplate.timeStart}-${slotTemplate.timeEnd}`;
                    if (
                        !occupiedSlots.has(slotKey) &&
                        !patientBlockedSlots.has(slotKey) &&
                        !this.isSlotInPast(currentDate, slotTemplate.timeStart)
                    ) {
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

    async hasAvailabilityOnDate(date: Date, nutritionistId: string): Promise<boolean> {
        this.assertNutritionistId(nutritionistId);

        const slots = await this.listAvailableSlots(date, nutritionistId);
        return slots.length > 0;
    }

    private assertNutritionistId(nutritionistId: string): void {
        assertNonEmpty(nutritionistId, 'Nutricionista inválida.');
    }

    private assertValidRange(startDate: Date, endDate: Date): void {
        assertValidRange(startDate, endDate, 'Intervalo de datas inválido.');
    }

    private async getAcceptedAppointmentsForDate(
        date: string,
        nutritionistId: string
    ): Promise<Appointment[]> {
        const appointments = await this.appointmentRepository.listByDate(date, nutritionistId);
        return appointments.filter(appt => appt.status === 'accepted');
    }

    private async getPatientBlockedSlots(date: string, patientId?: string): Promise<Set<string>> {
        if (!patientId) {
            return new Set<string>();
        }

        const appointments = await this.appointmentRepository.listByPatient(patientId);
        const blocked = appointments.filter(
            appt => appt.date === date && this.isBlockedForPatient(appt.status)
        );
        return new Set(blocked.map(appt => `${appt.timeStart}-${appt.timeEnd}`));
    }

    private isBlockedForPatient(status: Appointment['status']): boolean {
        return status === 'pending';
    }

    private isDateInPast(date: Date): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const input = new Date(date);
        input.setHours(0, 0, 0, 0);
        return input < today;
    }

    private isSlotInPast(date: Date, timeStart: string): boolean {
        const [hours, minutes] = timeStart.split(":").map(Number);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) {
            return true;
        }

        const slotStart = new Date(date);
        slotStart.setHours(hours, minutes, 0, 0);
        return new Date() > slotStart;
    }
}
