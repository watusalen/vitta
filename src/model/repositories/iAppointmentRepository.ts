import Appointment, { AppointmentStatus } from "../entities/appointment";

export interface IAppointmentRepository {
    create(appointment: Appointment): Promise<void>;
    getById(id: string): Promise<Appointment | null>;
    listByPatient(patientId: string): Promise<Appointment[]>;
    listByDate(date: string, nutritionistId?: string): Promise<Appointment[]>;
    listByStatus(status: AppointmentStatus, nutritionistId?: string): Promise<Appointment[]>;
    listAcceptedByDateRange(startDate: string, endDate: string, nutritionistId: string): Promise<Appointment[]>;
    updateStatus(id: string, status: AppointmentStatus): Promise<void>;
    onPatientAppointmentsChange(patientId: string, callback: (appointments: Appointment[]) => void): () => void;
}
