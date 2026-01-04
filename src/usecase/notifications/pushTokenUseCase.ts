import { IPushNotificationService } from "@/model/services/iPushNotificationService";
import { IUserRepository } from "@/model/repositories/iUserRepository";
import { IPushTokenUseCase } from "@/usecase/notifications/iPushTokenUseCase";

export default class PushTokenUseCase implements IPushTokenUseCase {
    constructor(
        private pushService: IPushNotificationService,
        private userRepository: IUserRepository
    ) {}

    async register(userId: string): Promise<void> {
        await this.pushService.configureAndroidChannel();
        const token = await this.pushService.getDevicePushToken();
        if (!token) return;
        await this.userRepository.addPushToken(userId, token);
    }

    async unregister(userId: string): Promise<void> {
        const token = await this.pushService.getDevicePushToken();
        if (!token) return;
        await this.userRepository.removePushToken(userId, token);
    }
}
