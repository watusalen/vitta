import Appointment from "@/model/entities/appointment";

export interface ICancelAppointmentUseCase {
    cancelAppointment(appointmentId: string): Promise<Appointment>;
    prepareCancel(appointmentId: string): Promise<void>;
}
