export type AppointmentStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export default interface Appointment {
    id: string;
    patientId: string;
    nutritionistId: string;
    date: string;
    timeStart: string;
    timeEnd: string;
    status: AppointmentStatus;
    observations?: string;
    createdAt: Date;
    updatedAt: Date;
}