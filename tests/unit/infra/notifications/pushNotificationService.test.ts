import PushNotificationService from "@/infra/notifications/pushNotificationService";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Linking } from "react-native";

let isDeviceValue = true;

jest.mock("expo-constants", () => ({
    expoConfig: { extra: { eas: { projectId: "test-project" } } },
    easConfig: { projectId: "test-project" },
}));

jest.mock("expo-device", () => ({
    get isDevice() {
        return isDeviceValue;
    },
    __setIsDevice: (value: boolean) => {
        isDeviceValue = value;
    },
}));

jest.mock("expo-notifications", () => ({
    getPermissionsAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    getExpoPushTokenAsync: jest.fn(),
    setNotificationChannelAsync: jest.fn(),
    AndroidImportance: {
        HIGH: 4,
    },
    IosAuthorizationStatus: {
        AUTHORIZED: 2,
        PROVISIONAL: 3,
        DENIED: 1,
    },
}));

jest.mock("react-native", () => ({
    Platform: { OS: "ios" },
    Linking: { openSettings: jest.fn() },
}));

const setPlatform = (os: "ios" | "android") => {
    Object.defineProperty(Platform, "OS", { value: os, configurable: true });
};

describe("PushNotificationService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setPlatform("ios");
        (Device as { __setIsDevice?: (value: boolean) => void }).__setIsDevice?.(true);
    });

    it("deve retornar permissao concedida no iOS", async () => {
        (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
            ios: { status: Notifications.IosAuthorizationStatus.AUTHORIZED },
        });
        const service = new PushNotificationService();

        await expect(service.getPermissionStatus()).resolves.toBe("granted");
    });

    it("deve retornar permissao concedida no Android", async () => {
        setPlatform("android");
        (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
            granted: true,
            status: "granted",
        });
        const service = new PushNotificationService();

        await expect(service.getPermissionStatus()).resolves.toBe("granted");
    });

    it("deve pedir permissao e respeitar status", async () => {
        (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
            ios: { status: Notifications.IosAuthorizationStatus.DENIED },
        });
        const service = new PushNotificationService();

        await expect(service.requestPermissions()).resolves.toBe("denied");
    });

    it("nao deve retornar token quando nao e device", async () => {
        (Device as { __setIsDevice?: (value: boolean) => void }).__setIsDevice?.(false);
        const service = new PushNotificationService();

        await expect(service.getDevicePushToken()).resolves.toBeNull();
    });

    it("deve retornar token quando disponivel", async () => {
        (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: "token-1" });
        const service = new PushNotificationService();

        await expect(service.getDevicePushToken()).resolves.toBe("token-1");
    });

    it("deve configurar canal no Android", async () => {
        setPlatform("android");
        const service = new PushNotificationService();

        await service.configureAndroidChannel();

        expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith("appointments", {
            name: "Consultas",
            importance: Notifications.AndroidImportance.HIGH,
        });
    });

    it("deve abrir ajustes", async () => {
        const service = new PushNotificationService();

        await service.openSettings();

        expect(Linking.openSettings).toHaveBeenCalled();
    });
});
