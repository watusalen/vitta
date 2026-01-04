import Appointment from "@/model/entities/appointment";

export interface IResolveAppointmentConflictUseCase {
    resolveConflict(appointmentId: string): Promise<Appointment>;
}
