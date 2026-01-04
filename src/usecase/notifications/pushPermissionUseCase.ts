import { IPushNotificationService } from "@/model/services/iPushNotificationService";
import { IPushPermissionUseCase } from "@/usecase/notifications/iPushPermissionUseCase";

export default class PushPermissionUseCase implements IPushPermissionUseCase {
    constructor(private pushService: IPushNotificationService) {}

    async checkPermission() {
        return this.pushService.getPermissionStatus();
    }

    async requestPermission() {
        await this.pushService.configureAndroidChannel();
        return this.pushService.requestPermissions();
    }

    async openSettings() {
        await this.pushService.openSettings();
    }
}
