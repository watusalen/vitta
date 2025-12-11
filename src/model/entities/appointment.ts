export default interface Appointment {
    id: string;
    patientId: string;
    nutritionistId: string;
    date: string;
    timeStart: string;
    timeEnd: string;
    status: 'pending' | 'accepted' | 'rejected' | 'canceled';
    observations?: string;
    createdAt: Date;
    updatedAt: Date;
}