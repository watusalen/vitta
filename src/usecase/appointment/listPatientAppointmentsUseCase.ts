import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";

/**
 * Opções de filtro para listar consultas
 */
export interface ListAppointmentsFilter {
    /** Filtrar apenas consultas futuras */
    futureOnly?: boolean;
    /** Filtrar por status específico */
    status?: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}

/**
 * Interface para o caso de uso de listar consultas do paciente
 */
export interface IListPatientAppointmentsUseCase {
    /**
     * Lista todas as consultas de um paciente
     * @param patientId - ID do paciente
     * @param filter - Filtros opcionais
     * @returns Lista de consultas ordenadas por data (mais recente primeiro)
     */
    execute(patientId: string, filter?: ListAppointmentsFilter): Promise<Appointment[]>;

    /**
     * Escuta mudanças em tempo real nas consultas do paciente
     * @param patientId - ID do paciente
     * @param callback - Função chamada quando há mudanças
     * @returns Função para cancelar a escuta
     */
    subscribe(
        patientId: string,
        callback: (appointments: Appointment[]) => void
    ): () => void;
}

/**
 * Caso de uso para listar consultas de um paciente
 * 
 * Regras de negócio:
 * - Lista ordenada por data (mais recente primeiro)
 * - Suporta filtros: futureOnly, status
 * - Suporta escuta em tempo real via Firebase
 */
export default class ListPatientAppointmentsUseCase implements IListPatientAppointmentsUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(patientId: string, filter?: ListAppointmentsFilter): Promise<Appointment[]> {
        let appointments = await this.appointmentRepository.listByPatient(patientId);

        // Aplicar filtro de status
        if (filter?.status) {
            appointments = appointments.filter(appt => appt.status === filter.status);
        }

        // Aplicar filtro de consultas futuras
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

    /**
     * Retorna a data de hoje no formato YYYY-MM-DD
     */
    private getTodayString(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
