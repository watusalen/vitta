import { useState, useEffect, useCallback } from "react";
import Appointment from "@/model/entities/appointment";
import { IListPatientAppointmentsUseCase, ListAppointmentsFilter } from "@/usecase/appointment/listPatientAppointmentsUseCase";
import RepositoryError from "@/model/errors/repositoryError";

export interface MyAppointmentsState {
    appointments: Appointment[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    currentFilter: ListAppointmentsFilter;
}

export interface MyAppointmentsActions {
    loadAppointments: () => Promise<void>;
    refresh: () => Promise<void>;
    setStatusFilter: (status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | undefined) => void;
    setFutureOnlyFilter: (futureOnly: boolean) => void;
    clearFilters: () => void;
    clearError: () => void;
}

export default function useMyAppointmentsViewModel(
    listPatientAppointmentsUseCase: IListPatientAppointmentsUseCase,
    patientId: string
): MyAppointmentsState & MyAppointmentsActions {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentFilter, setCurrentFilter] = useState<ListAppointmentsFilter>({});

    const loadAppointments = useCallback(async (): Promise<void> => {
        if (!patientId) return;

        setError(null);

        try {
            const result = await listPatientAppointmentsUseCase.execute(patientId, currentFilter);
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
    }, [patientId, currentFilter, listPatientAppointmentsUseCase]);

    const refresh = useCallback(async (): Promise<void> => {
        setRefreshing(true);
        await loadAppointments();
    }, [loadAppointments]);

    const setStatusFilter = useCallback((status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | undefined): void => {
        setCurrentFilter(prev => ({ ...prev, status }));
    }, []);

    const setFutureOnlyFilter = useCallback((futureOnly: boolean): void => {
        setCurrentFilter(prev => ({ ...prev, futureOnly }));
    }, []);

    const clearFilters = useCallback((): void => {
        setCurrentFilter({});
    }, []);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    useEffect(() => {
        setLoading(true);
        loadAppointments();
    }, [loadAppointments]);

    useEffect(() => {
        if (!patientId) return;

        const unsubscribe = listPatientAppointmentsUseCase.subscribe(patientId, (updatedAppointments) => {
            let filtered = updatedAppointments;

            if (currentFilter.status) {
                filtered = filtered.filter(a => a.status === currentFilter.status);
            }

            if (currentFilter.futureOnly) {
                const today = new Date().toISOString().split('T')[0];
                filtered = filtered.filter(a => a.date >= today);
            }

            setAppointments(filtered);
        });

        return () => unsubscribe();
    }, [patientId, currentFilter, listPatientAppointmentsUseCase]);

    return {
        appointments,
        loading,
        refreshing,
        error,
        currentFilter,
        loadAppointments,
        refresh,
        setStatusFilter,
        setFutureOnlyFilter,
        clearFilters,
        clearError,
    };
}
