import Appointment, { AppointmentStatus } from "../entities/appointment";
import { generateId } from "../utils/idUtils";

interface CreateAppointmentInput {
    id?: string;
    patientId: string;
    nutritionistId: string;
    date: string;
    timeStart: string;
    timeEnd: string;
    status?: AppointmentStatus;
    calendarEventIdPatient?: string;
    calendarEventIdNutritionist?: string;
}

export function makeAppointment(input: CreateAppointmentInput): Appointment {
    const now = new Date();

    return {
        id: input.id ?? generateId('appt'),
        patientId: input.patientId,
        nutritionistId: input.nutritionistId,
        date: input.date,
        timeStart: input.timeStart,
        timeEnd: input.timeEnd,
        status: input.status ?? 'pending',
        calendarEventIdPatient: input.calendarEventIdPatient,
        calendarEventIdNutritionist: input.calendarEventIdNutritionist,
        createdAt: now,
        updatedAt: now,
    };
}
