import Appointment from "@/model/entities/appointment";

export interface IReactivateAppointmentUseCase {
    reactivateAppointment(appointmentId: string): Promise<Appointment>;
}
