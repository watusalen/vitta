import { useCallback, useEffect, useState } from "react";
import { PushPermissionStatus } from "@/model/services/iPushNotificationService";
import { IPushPermissionUseCase } from "@/usecase/notifications/iPushPermissionUseCase";

export type PushPermissionState = {
    status: PushPermissionStatus | null;
    loading: boolean;
    error: string | null;
};

export type PushPermissionActions = {
    refreshStatus: () => Promise<void>;
    requestPermission: () => Promise<void>;
    openSettings: () => Promise<void>;
    clearError: () => void;
};

export default function usePushPermissionViewModel(
    pushPermissionUseCase: IPushPermissionUseCase
): PushPermissionState & PushPermissionActions {
    const [status, setStatus] = useState<PushPermissionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshStatus = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const permission = await pushPermissionUseCase.checkPermission();
            setStatus(permission);
        } catch {
            setError("Não foi possível verificar a permissão de notificações.");
        } finally {
            setLoading(false);
        }
    }, [pushPermissionUseCase]);

    const requestPermission = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const permission = await pushPermissionUseCase.requestPermission();
            setStatus(permission);
        } catch {
            setError("Não foi possível solicitar a permissão de notificações.");
        } finally {
            setLoading(false);
        }
    }, [pushPermissionUseCase]);

    const openSettings = useCallback(async (): Promise<void> => {
        try {
            await pushPermissionUseCase.openSettings();
        } catch {
            setError("Não foi possível abrir os ajustes.");
        }
    }, [pushPermissionUseCase]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    return {
        status,
        loading,
        error,
        refreshStatus,
        requestPermission,
        openSettings,
        clearError,
    };
}
