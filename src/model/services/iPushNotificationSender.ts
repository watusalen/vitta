export type PushNotificationPayload = {
    title: string;
    body: string;
    data?: Record<string, string>;
};

export interface IPushNotificationSender {
    sendPush(tokens: string[], payload: PushNotificationPayload): Promise<void>;
}
