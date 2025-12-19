import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import RepositoryError from "@/model/errors/repositoryError";

export interface IGetAppointmentDetailsUseCase {
    execute(appointmentId: string): Promise<Appointment | null>;
}

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
