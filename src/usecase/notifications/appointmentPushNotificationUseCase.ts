import Appointment from "@/model/entities/appointment";
import { IUserRepository } from "@/model/repositories/iUserRepository";
import { IPushNotificationSender } from "@/model/services/iPushNotificationSender";
import {
    AppointmentNotificationType,
    IAppointmentPushNotificationUseCase,
    NotificationTarget,
} from "@/usecase/notifications/iAppointmentPushNotificationUseCase";

type NotificationCopy = {
    title: string;
    body: string;
};

export default class AppointmentPushNotificationUseCase implements IAppointmentPushNotificationUseCase {
    constructor(
        private userRepository: IUserRepository,
        private sender: IPushNotificationSender
    ) {}

    async notify(
        appointment: Appointment,
        type: AppointmentNotificationType,
        target: NotificationTarget
    ): Promise<void> {
        const targetUserId = target === "patient" ? appointment.patientId : appointment.nutritionistId;
        const tokens = await this.userRepository.getPushTokens(targetUserId);
        if (!tokens.length) {
            return;
        }

        const patientName = await this.getUserName(appointment.patientId);
        const nutritionistName = await this.getUserName(appointment.nutritionistId);
        const copy = buildCopy(type, appointment, { patientName, nutritionistName }, target);

        await this.sender.sendPush(tokens, {
            title: copy.title,
            body: copy.body,
            data: {
                url:
                    target === "patient"
                        ? `/appointment/${appointment.id}`
                        : `/nutritionist-appointment/${appointment.id}`,
                appointmentId: appointment.id,
                status: type,
            },
        });
    }

    private async getUserName(userId: string): Promise<string> {
        const user = await this.userRepository.getUserByID(userId);
        return user?.name ?? "Usuário";
    }
}

function buildCopy(
    type: AppointmentNotificationType,
    appointment: Appointment,
    names: { patientName: string; nutritionistName: string },
    target: NotificationTarget
): NotificationCopy {
    const dateLabel = formatDate(appointment.date);
    const timeLabel = appointment.timeStart;

    switch (type) {
        case "requested":
            return {
                title: "Nova solicitação de consulta",
                body: `${names.patientName} solicitou uma consulta para ${dateLabel} às ${timeLabel}.`,
            };
        case "accepted":
            return {
                title: "Consulta confirmada",
                body: `Sua consulta com ${names.nutritionistName} em ${dateLabel} às ${timeLabel} foi confirmada.`,
            };
        case "rejected":
            return {
                title: "Consulta recusada",
                body: `Sua consulta em ${dateLabel} às ${timeLabel} foi recusada.`,
            };
        case "cancelled":
            const cancelledBy =
                target === "patient"
                    ? `Nutricionista ${names.nutritionistName}`
                    : `Paciente ${names.patientName}`;
            return {
                title: "Consulta cancelada",
                body: `${cancelledBy} cancelou a consulta em ${dateLabel} às ${timeLabel}.`,
            };
        case "reactivated":
            return {
                title: "Consulta reativada",
                body: `A consulta em ${dateLabel} às ${timeLabel} foi reativada.`,
            };
        default:
            return {
                title: "Atualização de consulta",
                body: `Sua consulta em ${dateLabel} às ${timeLabel} foi atualizada.`,
            };
    }
}

function formatDate(date: string): string {
    const [year, month, day] = date.split("-");
    if (!day || !month || !year) {
        return date;
    }
    return `${day}/${month}/${year}`;
}
