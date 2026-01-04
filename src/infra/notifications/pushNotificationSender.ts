import { IPushNotificationSender, PushNotificationPayload } from "@/model/services/iPushNotificationSender";
import { getPublicEnv } from "@/infra/env/publicEnv";

const DEFAULT_EDGE_FUNCTION_PATH = "/functions/v1/push-notify";

export default class PushNotificationSender implements IPushNotificationSender {
    private baseUrl?: string;
    private anonKey?: string;

    constructor(baseUrl?: string, anonKey?: string) {
        this.baseUrl = baseUrl ?? getPublicEnv("EXPO_PUBLIC_SUPABASE_URL");
        this.anonKey = anonKey ?? getPublicEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY");
    }

    async sendPush(tokens: string[], payload: PushNotificationPayload): Promise<void> {
        if (!this.baseUrl) {
            console.warn("Supabase URL não configurada. Notificação ignorada.");
            return;
        }

        if (!tokens.length) {
            return;
        }

        const url = `${this.baseUrl}${DEFAULT_EDGE_FUNCTION_PATH}`;
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (this.anonKey) {
            headers.Authorization = `Bearer ${this.anonKey}`;
            headers.apikey = this.anonKey;
        }

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({
                tokens,
                title: payload.title,
                body: payload.body,
                data: payload.data ?? {},
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Erro ao enviar notificação: ${text}`);
        }
    }
}
