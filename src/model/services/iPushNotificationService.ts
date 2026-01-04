export type PushPermissionStatus = "granted" | "denied" | "undetermined";

export interface IPushNotificationService {
    getPermissionStatus(): Promise<PushPermissionStatus>;
    requestPermissions(): Promise<PushPermissionStatus>;
    getDevicePushToken(): Promise<string | null>;
    configureAndroidChannel(): Promise<void>;
    openSettings(): Promise<void>;
}
