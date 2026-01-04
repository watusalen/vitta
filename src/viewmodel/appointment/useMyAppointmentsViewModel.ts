import { useState, useEffect, useCallback, useRef } from "react";
import Appointment from "@/model/entities/appointment";
import { IListPatientAppointmentsUseCase } from "@/usecase/appointment/list/iListPatientAppointmentsUseCase";
import RepositoryError from "@/model/errors/repositoryError";
import { IAppointmentCalendarSyncUseCase } from "@/usecase/calendar/iAppointmentCalendarSyncUseCase";

export interface MyAppointmentsState {
    appointments: Appointment[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    navigationRoute: string | null;
    navigationMethod: "replace" | "push";
}

export interface MyAppointmentsActions {
    loadAppointments: () => Promise<void>;
    refresh: () => Promise<void>;
    clearError: () => void;
    openAppointment: (appointmentId: string) => void;
    goBack: () => void;
    clearNavigation: () => void;
}

export default function useMyAppointmentsViewModel(
    listPatientAppointmentsUseCase: IListPatientAppointmentsUseCase,
    calendarSyncUseCase: IAppointmentCalendarSyncUseCase,
    patientId: string
): MyAppointmentsState & MyAppointmentsActions {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [navigationRoute, setNavigationRoute] = useState<string | null>(null);
    const [navigationMethod, setNavigationMethod] = useState<"replace" | "push">("replace");
    const syncInFlightRef = useRef(new Set<string>());

    const syncAppointmentCalendar = useCallback(async (appointment: Appointment): Promise<void> => {
        const key = appointment.id;
        if (syncInFlightRef.current.has(key)) {
            return;
        }

        if (appointment.status === "accepted") {
            if (appointment.calendarEventIdPatient) {
                return;
            }
            syncInFlightRef.current.add(key);
            try {
                await calendarSyncUseCase.syncAccepted(appointment, "patient");
            } finally {
                syncInFlightRef.current.delete(key);
            }
            return;
        }

        if (appointment.status === "cancelled" || appointment.status === "rejected") {
            if (!appointment.calendarEventIdPatient) {
                return;
            }
            syncInFlightRef.current.add(key);
            try {
                await calendarSyncUseCase.syncCancelledOrRejected(appointment, "patient");
            } finally {
                syncInFlightRef.current.delete(key);
            }
        }
    }, [calendarSyncUseCase]);

    const loadAppointments = useCallback(async (): Promise<void> => {
        if (!patientId) return;

        setError(null);

        try {
            const result = await listPatientAppointmentsUseCase.listByPatient(patientId);
            setAppointments(result);
        } catch (err) {
            if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError('Erro ao carregar consultas.');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [patientId, listPatientAppointmentsUseCase]);

    const refresh = useCallback(async (): Promise<void> => {
        setRefreshing(true);
        await loadAppointments();
    }, [loadAppointments]);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    const openAppointment = useCallback((appointmentId: string) => {
        setNavigationMethod("push");
        setNavigationRoute(`/appointment/${appointmentId}`);
    }, []);

    const goBack = useCallback(() => {
        setNavigationMethod("replace");
        setNavigationRoute("/patient-home");
    }, []);

    const clearNavigation = useCallback(() => {
        setNavigationRoute(null);
    }, []);

    useEffect(() => {
        setLoading(true);
        loadAppointments();
    }, [loadAppointments]);

    useEffect(() => {
        if (!patientId) return;

        const unsubscribe = listPatientAppointmentsUseCase.subscribeToPatientAppointments(
            patientId,
            (updatedAppointments) => {
                setAppointments(updatedAppointments);
                updatedAppointments.forEach((appointment) => {
                    void syncAppointmentCalendar(appointment);
                });
            }
        );

        return () => unsubscribe();
    }, [patientId, listPatientAppointmentsUseCase, syncAppointmentCalendar]);

    return {
        appointments,
        loading,
        refreshing,
        error,
        navigationRoute,
        navigationMethod,
        loadAppointments,
        refresh,
        clearError,
        openAppointment,
        goBack,
        clearNavigation,
    };
}
