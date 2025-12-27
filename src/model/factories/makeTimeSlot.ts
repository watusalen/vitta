import TimeSlot from "../entities/timeSlot";

interface CreateTimeSlotInput {
    date: string;
    timeStart: string;
    timeEnd: string;
    available?: boolean;
}

export function makeTimeSlot(input: CreateTimeSlotInput): TimeSlot {
    return {
        date: input.date,
        timeStart: input.timeStart,
        timeEnd: input.timeEnd,
        available: input.available ?? true,
    };
}
