import { useCallback, useEffect, useState } from "react";
import { CalendarPermissionStatus } from "@/model/services/iCalendarService";
import { ICalendarPermissionUseCase } from "@/usecase/calendar/iCalendarPermissionUseCase";

export type CalendarPermissionState = {
    status: CalendarPermissionStatus | null;
    loading: boolean;
    error: string | null;
};

export type CalendarPermissionActions = {
    refreshStatus: () => Promise<void>;
    requestPermission: () => Promise<void>;
    openSettings: () => Promise<void>;
    clearError: () => void;
};

export default function useCalendarPermissionViewModel(
    calendarPermissionUseCase: ICalendarPermissionUseCase
): CalendarPermissionState & CalendarPermissionActions {
    const [status, setStatus] = useState<CalendarPermissionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshStatus = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const permission = await calendarPermissionUseCase.checkPermission();
            setStatus(permission);
        } catch {
            setError("Não foi possível verificar a permissão do calendário.");
        } finally {
            setLoading(false);
        }
    }, [calendarPermissionUseCase]);

    const requestPermission = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const permission = await calendarPermissionUseCase.requestPermission();
            setStatus(permission);
        } catch {
            setError("Não foi possível solicitar a permissão do calendário.");
        } finally {
            setLoading(false);
        }
    }, [calendarPermissionUseCase]);

    const openSettings = useCallback(async (): Promise<void> => {
        try {
            await calendarPermissionUseCase.openSettings();
        } catch {
            setError("Não foi possível abrir os ajustes.");
        }
    }, [calendarPermissionUseCase]);

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
