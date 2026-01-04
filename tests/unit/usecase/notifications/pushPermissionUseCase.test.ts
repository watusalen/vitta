import PushPermissionUseCase from "@/usecase/notifications/pushPermissionUseCase";
import { IPushNotificationService } from "@/model/services/iPushNotificationService";

describe("PushPermissionUseCase", () => {
    let service: jest.Mocked<IPushNotificationService>;

    beforeEach(() => {
        service = {
            getPermissionStatus: jest.fn(),
            requestPermissions: jest.fn(),
            getDevicePushToken: jest.fn(),
            configureAndroidChannel: jest.fn(),
            openSettings: jest.fn(),
        };
    });

    it("deve consultar o status da permissão", async () => {
        service.getPermissionStatus.mockResolvedValue("granted");
        const useCase = new PushPermissionUseCase(service);

        await expect(useCase.checkPermission()).resolves.toBe("granted");
        expect(service.getPermissionStatus).toHaveBeenCalled();
    });

    it("deve solicitar permissão e configurar canal", async () => {
        service.requestPermissions.mockResolvedValue("granted");
        const useCase = new PushPermissionUseCase(service);

        const result = await useCase.requestPermission();

        expect(service.configureAndroidChannel).toHaveBeenCalled();
        expect(service.requestPermissions).toHaveBeenCalled();
        expect(result).toBe("granted");
    });

    it("deve abrir os ajustes", async () => {
        const useCase = new PushPermissionUseCase(service);

        await useCase.openSettings();

        expect(service.openSettings).toHaveBeenCalled();
    });
});
