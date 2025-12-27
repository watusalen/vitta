import Appointment from "@/model/entities/appointment";

export interface IRejectAppointmentUseCase {
    rejectAppointment(appointmentId: string): Promise<Appointment>;
    prepareRejection(appointmentId: string): Promise<void>;
}
