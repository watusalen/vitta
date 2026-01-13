import EmissorNotificacaoPush from "@/infra/notifications/pushNotificationSender";

const mockFetch = jest.fn();

describe("EmissorNotificacaoPush", () => {
    beforeEach(() => {
        mockFetch.mockReset();
        (global as any).fetch = mockFetch;
    });

    it("deve ignorar quando não houver baseUrl", async () => {
        const sender = new EmissorNotificacaoPush(undefined, undefined);

        await sender.sendPush(["token-1"], { title: "titulo", body: "corpo" });

        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("deve ignorar quando não houver tokens", async () => {
        const sender = new EmissorNotificacaoPush("https://example.com", undefined);

        await sender.sendPush([], { title: "titulo", body: "corpo" });

        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("deve enviar notificação para edge function", async () => {
        mockFetch.mockResolvedValue({ ok: true, text: async () => "" });
        const sender = new EmissorNotificacaoPush("https://example.com", "anon");

        await sender.sendPush(["token-1"], { title: "titulo", body: "corpo" });

        expect(mockFetch).toHaveBeenCalledWith("https://example.com/functions/v1/push-notify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer anon",
                apikey: "anon",
            },
            body: JSON.stringify({
                tokens: ["token-1"],
                title: "titulo",
                body: "corpo",
                data: {},
            }),
        });
    });

    it("deve lançar erro quando edge responder com falha", async () => {
        mockFetch.mockResolvedValue({ ok: false, text: async () => "erro" });
        const sender = new EmissorNotificacaoPush("https://example.com", undefined);

        await expect(
            sender.sendPush(["token-1"], { title: "titulo", body: "corpo" })
        ).rejects.toThrow("Erro ao enviar notificação: erro");
    });
});
