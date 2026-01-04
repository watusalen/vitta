import Appointment from "@/model/entities/appointment";

export type AppointmentNotificationType =
    | "requested"
    | "accepted"
    | "rejected"
    | "cancelled"
    | "reactivated";

export type NotificationTarget = "patient" | "nutritionist";

export interface IAppointmentPushNotificationUseCase {
    notify(
        appointment: Appointment,
        type: AppointmentNotificationType,
        target: NotificationTarget
    ): Promise<void>;
}
