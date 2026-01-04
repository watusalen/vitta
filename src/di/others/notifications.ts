import PushNotificationService from "@/infra/notifications/pushNotificationService";
import PushNotificationSender from "@/infra/notifications/pushNotificationSender";
import PushPermissionUseCase from "@/usecase/notifications/pushPermissionUseCase";
import PushTokenUseCase from "@/usecase/notifications/pushTokenUseCase";
import { IPushPermissionUseCase } from "@/usecase/notifications/iPushPermissionUseCase";
import { IPushTokenUseCase } from "@/usecase/notifications/iPushTokenUseCase";
import { IAppointmentPushNotificationUseCase } from "@/usecase/notifications/iAppointmentPushNotificationUseCase";
import AppointmentPushNotificationUseCase from "@/usecase/notifications/appointmentPushNotificationUseCase";
import { getUserRepository, getInitError } from "@/di/others/base";

let pushService: PushNotificationService | null = null;
let pushSender: PushNotificationSender | null = null;
let pushPermissionUseCase: IPushPermissionUseCase | null = null;
let pushTokenUseCase: IPushTokenUseCase | null = null;
let appointmentPushNotificationUseCase: IAppointmentPushNotificationUseCase | null = null;
let initError: Error | null = null;

function initPushNotifications() {
    if ((pushPermissionUseCase && pushTokenUseCase && appointmentPushNotificationUseCase) || initError) {
        return;
    }

    try {
        const baseError = getInitError();
        if (baseError) {
            throw baseError;
        }
        if (!pushService) {
            pushService = new PushNotificationService();
        }
        if (!pushSender) {
            pushSender = new PushNotificationSender();
        }
        pushPermissionUseCase = new PushPermissionUseCase(pushService);
        pushTokenUseCase = new PushTokenUseCase(pushService, getUserRepository());
        appointmentPushNotificationUseCase = new AppointmentPushNotificationUseCase(
            getUserRepository(),
            pushSender
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao inicializar notificações";
        console.error("Erro fatal ao inicializar dependências:", errorMessage);
        initError = new Error(`Falha ao inicializar aplicação: ${errorMessage}`);
    }
}

export function getPushPermissionUseCase() {
    initPushNotifications();
    if (!pushPermissionUseCase) {
        throw initError ?? new Error("Falha ao inicializar permissões de notificações");
    }
    return pushPermissionUseCase;
}

export function getPushTokenUseCase() {
    initPushNotifications();
    if (!pushTokenUseCase) {
        throw initError ?? new Error("Falha ao inicializar tokens de notificações");
    }
    return pushTokenUseCase;
}

export function getAppointmentPushNotificationUseCase() {
    initPushNotifications();
    if (!appointmentPushNotificationUseCase) {
        throw initError ?? new Error("Falha ao inicializar notificações de consultas");
    }
    return appointmentPushNotificationUseCase;
}
