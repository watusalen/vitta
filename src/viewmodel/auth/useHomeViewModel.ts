import { useEffect, useState, useCallback } from "react";
import User from "@/model/entities/user";
import AuthError from "@/model/errors/authError";
import { IAuthUseCases } from "@/usecase/auth/iAuthUseCases";
import { ICalendarPermissionUseCase } from "@/usecase/calendar/iCalendarPermissionUseCase";
import { CalendarPermissionStatus } from "@/model/services/iCalendarService";
import { IPushPermissionUseCase } from "@/usecase/notifications/iPushPermissionUseCase";
import { IPushTokenUseCase } from "@/usecase/notifications/iPushTokenUseCase";
import { PushPermissionStatus } from "@/model/services/iPushNotificationService";

export type HomeState = {
    user: User | null;
    loading: boolean;
    error: string | null;
    unauthenticatedRedirect: string | null;
    calendarPermissionRedirect: string | null;
    startupRedirect: string | null;
};

export type HomeActions = {
    logout: () => Promise<void>;
    clearError: () => void;
};

export default function useHomeViewModel(
    authUseCases: IAuthUseCases,
    calendarPermissionUseCase: ICalendarPermissionUseCase,
    pushPermissionUseCase: IPushPermissionUseCase,
    pushTokenUseCase: IPushTokenUseCase
): HomeState & HomeActions {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [calendarPermission, setCalendarPermission] = useState<CalendarPermissionStatus | null>(null);
    const [pushPermission, setPushPermission] = useState<PushPermissionStatus | null>(null);

    useEffect(() => {
        const unsubscribe = authUseCases.onAuthStateChanged((authUser) => {
            setUser(authUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [authUseCases]);

    useEffect(() => {
        let cancelled = false;

        async function checkPermission() {
            if (!user) {
                setCalendarPermission(null);
                return;
            }
            try {
                const status = await calendarPermissionUseCase.checkPermission();
                if (cancelled) return;
                if (status === "undetermined") {
                    const requested = await calendarPermissionUseCase.requestPermission();
                    if (!cancelled) {
                        setCalendarPermission(requested);
                    }
                    return;
                }
                setCalendarPermission(status);
            } catch {
                if (!cancelled) {
                    setCalendarPermission("denied");
                }
            }
        }

        checkPermission();

        return () => {
            cancelled = true;
        };
    }, [user, calendarPermissionUseCase]);

    useEffect(() => {
        let cancelled = false;

        async function checkPushPermission() {
            if (!user) {
                setPushPermission(null);
                return;
            }

            if (!calendarPermission || calendarPermission === "undetermined") {
                return;
            }

            if (calendarPermission === "denied" || calendarPermission === "restricted") {
                setPushPermission(null);
                return;
            }

            try {
                const status = await pushPermissionUseCase.checkPermission();
                if (cancelled) return;
                if (status === "undetermined") {
                    const requested = await pushPermissionUseCase.requestPermission();
                    if (!cancelled) {
                        setPushPermission(requested);
                    }
                    return;
                }
                setPushPermission(status);
            } catch {
                if (!cancelled) {
                    setPushPermission("denied");
                }
            }
        }

        checkPushPermission();

        return () => {
            cancelled = true;
        };
    }, [user, calendarPermission, pushPermissionUseCase]);

    useEffect(() => {
        let cancelled = false;

        async function registerPushToken() {
            if (!user || pushPermission !== "granted") {
                return;
            }
            try {
                await pushTokenUseCase.register(user.id);
            } catch (error) {
                if (!cancelled) {
                    console.error("Erro ao registrar token de notificações:", error);
                }
            }
        }

        registerPushToken();

        return () => {
            cancelled = true;
        };
    }, [user, pushPermission, pushTokenUseCase]);

    const logout = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);

        const currentUserId = user?.id;
        try {
            if (currentUserId) {
                await pushTokenUseCase.unregister(currentUserId);
            }
            await authUseCases.logout();
            setUser(null);
        } catch (err: unknown) {
            if (err instanceof AuthError) {
                setError(err.message);
            } else {
                setError('Erro ao fazer logout');
            }
        } finally {
            setLoading(false);
        }
    }, [authUseCases, pushTokenUseCase, user]);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    const unauthenticatedRedirect = !loading && !user ? "/login" : null;
    const calendarPermissionRedirect =
        !loading && user
            ? pushPermission === "denied"
                ? "/notifications-permission"
                : calendarPermission === "denied" || calendarPermission === "restricted"
                    ? "/calendar-permission"
                    : null
            : null;
    const startupRedirect = !loading
        ? user
            ? pushPermission === "denied"
                ? "/notifications-permission"
                : calendarPermission === "denied" || calendarPermission === "restricted"
                    ? "/calendar-permission"
                    : user.role === "nutritionist"
                        ? "/nutritionist-home"
                        : "/patient-home"
            : "/login"
        : null;

    return {
        user,
        loading,
        error,
        unauthenticatedRedirect,
        calendarPermissionRedirect,
        startupRedirect,
        logout,
        clearError,
    };
}
