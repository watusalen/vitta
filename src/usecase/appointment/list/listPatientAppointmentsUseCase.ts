import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { IListPatientAppointmentsUseCase, ListAppointmentsFilter } from "@/usecase/appointment/list/iListPatientAppointmentsUseCase";
import { assertNonEmpty } from "@/usecase/utils/validationUtils";

export default class ListPatientAppointmentsUseCase implements IListPatientAppointmentsUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async listByPatient(patientId: string, filter?: ListAppointmentsFilter): Promise<Appointment[]> {
        this.assertPatientId(patientId);

        let appointments = await this.appointmentRepository.listByPatient(patientId);

        if (filter?.status) {
            appointments = appointments.filter(appt => appt.status === filter.status);
        }

        if (filter?.futureOnly) {
            const today = this.getTodayStringLocal();
            appointments = appointments.filter(appt => appt.date >= today);
        }

        return appointments;
    }

    subscribeToPatientAppointments(
        patientId: string,
        callback: (appointments: Appointment[]) => void
    ): () => void {
        this.assertPatientId(patientId);

        return this.appointmentRepository.onPatientAppointmentsChange(patientId, callback);
    }

    private getTodayStringLocal(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private assertPatientId(patientId: string): void {
        assertNonEmpty(patientId, 'Paciente inválido.');
    }
}
