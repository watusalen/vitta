import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";

export interface ListAppointmentsFilter {
    futureOnly?: boolean;
    status?: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}

export interface IListPatientAppointmentsUseCase {
    execute(patientId: string, filter?: ListAppointmentsFilter): Promise<Appointment[]>;
    subscribe(
        patientId: string,
        callback: (appointments: Appointment[]) => void
    ): () => void;
}

export default class ListPatientAppointmentsUseCase implements IListPatientAppointmentsUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(patientId: string, filter?: ListAppointmentsFilter): Promise<Appointment[]> {
        let appointments = await this.appointmentRepository.listByPatient(patientId);

        if (filter?.status) {
            appointments = appointments.filter(appt => appt.status === filter.status);
        }

        if (filter?.futureOnly) {
            const today = this.getTodayString();
            appointments = appointments.filter(appt => appt.date >= today);
        }

        return appointments;
    }

    subscribe(
        patientId: string,
        callback: (appointments: Appointment[]) => void
    ): () => void {
        return this.appointmentRepository.onPatientAppointmentsChange(patientId, callback);
    }

    private getTodayString(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
