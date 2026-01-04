import { PushPermissionStatus } from "@/model/services/iPushNotificationService";

export interface IPushPermissionUseCase {
    checkPermission(): Promise<PushPermissionStatus>;
    requestPermission(): Promise<PushPermissionStatus>;
    openSettings(): Promise<void>;
}
