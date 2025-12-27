import Appointment from "@/model/entities/appointment";

export interface IGetAppointmentDetailsUseCase {
    getById(appointmentId: string): Promise<Appointment | null>;
}
