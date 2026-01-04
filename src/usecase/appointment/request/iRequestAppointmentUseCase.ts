import Appointment from "@/model/entities/appointment";

export interface RequestAppointmentInput {
    appointmentId?: string;
    patientId: string;
    nutritionistId: string;
    date: Date;
    timeStart: string;
    timeEnd: string;
}

export interface IRequestAppointmentUseCase {
    requestAppointment(input: RequestAppointmentInput): Promise<Appointment>;
    prepareRequest(input: RequestAppointmentInput): Promise<Appointment>;
}
