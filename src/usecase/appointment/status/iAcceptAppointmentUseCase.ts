import Appointment from "@/model/entities/appointment";

export interface IAcceptAppointmentUseCase {
    acceptAppointment(appointmentId: string): Promise<Appointment>;
    prepareAcceptance(appointmentId: string): Promise<void>;
}
