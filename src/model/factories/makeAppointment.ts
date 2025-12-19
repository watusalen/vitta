import Appointment, { AppointmentStatus } from "../entities/appointment";

interface CreateAppointmentInput {
    id?: string;
    patientId: string;
    nutritionistId: string;
    date: string;
    timeStart: string;
    timeEnd: string;
    status?: AppointmentStatus;
    observations?: string;
}

function generateId(): string {
    if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
        return globalThis.crypto.randomUUID();
    }
    return `appt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function makeAppointment(input: CreateAppointmentInput): Appointment {
    const now = new Date();

    return {
        id: input.id ?? generateId(),
        patientId: input.patientId,
        nutritionistId: input.nutritionistId,
        date: input.date,
        timeStart: input.timeStart,
        timeEnd: input.timeEnd,
        status: input.status ?? 'pending',
        observations: input.observations,
        createdAt: now,
        updatedAt: now,
    };
}
