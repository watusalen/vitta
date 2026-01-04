import PushTokenUseCase from "@/usecase/notifications/pushTokenUseCase";
import { IPushNotificationService } from "@/model/services/iPushNotificationService";
import { IUserRepository } from "@/model/repositories/iUserRepository";

describe("PushTokenUseCase", () => {
    let service: jest.Mocked<IPushNotificationService>;
    let repository: jest.Mocked<IUserRepository>;

    beforeEach(() => {
        service = {
            getPermissionStatus: jest.fn(),
            requestPermissions: jest.fn(),
            getDevicePushToken: jest.fn(),
            configureAndroidChannel: jest.fn(),
            openSettings: jest.fn(),
        };
        repository = {
            createUser: jest.fn(),
            getUserByID: jest.fn(),
            getByRole: jest.fn(),
            addPushToken: jest.fn(),
            removePushToken: jest.fn(),
            getPushTokens: jest.fn(),
        };
    });

    it("deve registrar token quando disponível", async () => {
        service.getDevicePushToken.mockResolvedValue("token-1");
        const useCase = new PushTokenUseCase(service, repository);

        await useCase.register("user-1");

        expect(service.configureAndroidChannel).toHaveBeenCalled();
        expect(service.getDevicePushToken).toHaveBeenCalled();
        expect(repository.addPushToken).toHaveBeenCalledWith("user-1", "token-1");
    });

    it("nao deve registrar quando token estiver vazio", async () => {
        service.getDevicePushToken.mockResolvedValue(null);
        const useCase = new PushTokenUseCase(service, repository);

        await useCase.register("user-1");

        expect(repository.addPushToken).not.toHaveBeenCalled();
    });

    it("deve remover token quando disponível", async () => {
        service.getDevicePushToken.mockResolvedValue("token-1");
        const useCase = new PushTokenUseCase(service, repository);

        await useCase.unregister("user-1");

        expect(service.getDevicePushToken).toHaveBeenCalled();
        expect(repository.removePushToken).toHaveBeenCalledWith("user-1", "token-1");
    });

    it("nao deve remover quando token estiver vazio", async () => {
        service.getDevicePushToken.mockResolvedValue(null);
        const useCase = new PushTokenUseCase(service, repository);

        await useCase.unregister("user-1");

        expect(repository.removePushToken).not.toHaveBeenCalled();
    });
});
