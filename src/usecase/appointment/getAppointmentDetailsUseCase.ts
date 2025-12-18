import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import RepositoryError from "@/model/errors/repositoryError";

/**
 * Interface para o caso de uso de obter detalhes de uma consulta
 */
export interface IGetAppointmentDetailsUseCase {
    /**
     * Obtém os detalhes de uma consulta específica
     * @param appointmentId - ID da consulta
     * @returns Appointment ou null se não encontrado
     */
    execute(appointmentId: string): Promise<Appointment | null>;
}

/**
 * Caso de uso para obter detalhes de uma consulta
 */
export default class GetAppointmentDetailsUseCase implements IGetAppointmentDetailsUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(appointmentId: string): Promise<Appointment | null> {
        if (!appointmentId || appointmentId.trim() === '') {
            throw new RepositoryError('ID da consulta é obrigatório.');
        }

        return await this.appointmentRepository.getById(appointmentId);
    }
}
