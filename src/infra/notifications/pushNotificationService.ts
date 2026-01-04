import { Platform, Linking } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { IPushNotificationService, PushPermissionStatus } from "@/model/services/iPushNotificationService";

const DEFAULT_CHANNEL_ID = "appointments";

export default class PushNotificationService implements IPushNotificationService {
    async getPermissionStatus(): Promise<PushPermissionStatus> {
        const settings = await Notifications.getPermissionsAsync();
        if (Platform.OS === "ios") {
            const iosStatus = settings.ios?.status;
            if (iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED || iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL) {
                return "granted";
            }
            if (iosStatus === Notifications.IosAuthorizationStatus.DENIED) {
                return "denied";
            }
            return "undetermined";
        }
        return settings.granted ? "granted" : settings.status === "denied" ? "denied" : "undetermined";
    }

    async requestPermissions(): Promise<PushPermissionStatus> {
        const settings = await Notifications.requestPermissionsAsync({
            ios: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
            },
        });
        if (Platform.OS === "ios") {
            const iosStatus = settings.ios?.status;
            if (iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED || iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL) {
                return "granted";
            }
            if (iosStatus === Notifications.IosAuthorizationStatus.DENIED) {
                return "denied";
            }
            return "undetermined";
        }
        return settings.granted ? "granted" : settings.status === "denied" ? "denied" : "undetermined";
    }

    async getDevicePushToken(): Promise<string | null> {
        if (!Device.isDevice) {
            return null;
        }
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        const token = projectId
            ? await Notifications.getExpoPushTokenAsync({ projectId })
            : await Notifications.getExpoPushTokenAsync();
        return token.data;
    }

    async configureAndroidChannel(): Promise<void> {
        if (Platform.OS !== "android") {
            return;
        }

        await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
            name: "Consultas",
            importance: Notifications.AndroidImportance.HIGH,
        });
    }

    async openSettings(): Promise<void> {
        await Linking.openSettings();
    }
}
