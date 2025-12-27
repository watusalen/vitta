import TimeSlot from "@/model/entities/timeSlot";

export interface IGetAvailableTimeSlotsUseCase {
    listAvailableSlots(date: Date, nutritionistId: string, patientId?: string): Promise<TimeSlot[]>;
    listAvailableSlotsForRange(
        startDate: Date,
        endDate: Date,
        nutritionistId: string,
        patientId?: string
    ): Promise<Map<string, TimeSlot[]>>;
    hasAvailabilityOnDate(date: Date, nutritionistId: string): Promise<boolean>;
}
