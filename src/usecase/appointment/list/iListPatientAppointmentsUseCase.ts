import Appointment from "@/model/entities/appointment";

export interface ListAppointmentsFilter {
    futureOnly?: boolean;
    status?: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}

export interface IListPatientAppointmentsUseCase {
    listByPatient(patientId: string, filter?: ListAppointmentsFilter): Promise<Appointment[]>;
    subscribeToPatientAppointments(
        patientId: string,
        callback: (appointments: Appointment[]) => void
    ): () => void;
}
