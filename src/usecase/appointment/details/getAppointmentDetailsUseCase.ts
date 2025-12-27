import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { assertNonEmpty } from "@/usecase/utils/validationUtils";
import { IGetAppointmentDetailsUseCase } from "@/usecase/appointment/details/iGetAppointmentDetailsUseCase";
import Appointment from "@/model/entities/appointment";

export default class GetAppointmentDetailsUseCase implements IGetAppointmentDetailsUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async getById(appointmentId: string): Promise<Appointment | null> {
        this.assertValidId(appointmentId);

        return await this.appointmentRepository.getById(appointmentId);
    }

    private assertValidId(appointmentId: string): void {
        assertNonEmpty(appointmentId, 'ID da consulta é obrigatório.');
    }
}
