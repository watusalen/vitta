import { useState, useEffect, useCallback } from "react";
import Appointment from "@/model/entities/appointment";
import { IListPatientAppointmentsUseCase, ListAppointmentsFilter } from "@/usecase/appointment/listPatientAppointmentsUseCase";
import RepositoryError from "@/model/errors/repositoryError";

/**
 * Estado do ViewModel de Minhas Consultas
 */
export interface MyAppointmentsState {
    /** Lista de consultas do paciente */
    appointments: Appointment[];
    /** Indica se está carregando */
    loading: boolean;
    /** Indica se está atualizando (pull-to-refresh) */
    refreshing: boolean;
    /** Mensagem de erro */
    error: string | null;
    /** Filtro atual aplicado */
    currentFilter: ListAppointmentsFilter;
}

/**
 * Ações do ViewModel de Minhas Consultas
 */
export interface MyAppointmentsActions {
    /** Carrega/recarrega as consultas */
    loadAppointments: () => Promise<void>;
    /** Atualiza via pull-to-refresh */
    refresh: () => Promise<void>;
    /** Define filtro de status */
    setStatusFilter: (status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | undefined) => void;
    /** Define filtro de consultas futuras */
    setFutureOnlyFilter: (futureOnly: boolean) => void;
    /** Limpa todos os filtros */
    clearFilters: () => void;
    /** Limpa erro */
    clearError: () => void;
}

/**
 * ViewModel para tela de "Minhas Consultas"
 * 
 * Responsabilidades:
 * - Listar consultas do paciente
 * - Aplicar filtros (status, futureOnly)
 * - Suportar pull-to-refresh
 * - Escutar atualizações em tempo real
 */
export default function useMyAppointmentsViewModel(
    listPatientAppointmentsUseCase: IListPatientAppointmentsUseCase,
    patientId: string
): MyAppointmentsState & MyAppointmentsActions {
    // Estado
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentFilter, setCurrentFilter] = useState<ListAppointmentsFilter>({});

    /**
     * Carrega as consultas do paciente
     */
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

    /**
     * Atualiza via pull-to-refresh
     */
    const refresh = useCallback(async (): Promise<void> => {
        setRefreshing(true);
        await loadAppointments();
    }, [loadAppointments]);

    /**
     * Define filtro de status
     */
    const setStatusFilter = useCallback((status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | undefined): void => {
        setCurrentFilter(prev => ({ ...prev, status }));
    }, []);

    /**
     * Define filtro de consultas futuras
     */
    const setFutureOnlyFilter = useCallback((futureOnly: boolean): void => {
        setCurrentFilter(prev => ({ ...prev, futureOnly }));
    }, []);

    /**
     * Limpa todos os filtros
     */
    const clearFilters = useCallback((): void => {
        setCurrentFilter({});
    }, []);

    /**
     * Limpa erro
     */
    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    // Carregar consultas inicialmente e quando filtro muda
    useEffect(() => {
        setLoading(true);
        loadAppointments();
    }, [loadAppointments]);

    // Escutar atualizações em tempo real
    useEffect(() => {
        if (!patientId) return;

        const unsubscribe = listPatientAppointmentsUseCase.subscribe(patientId, (updatedAppointments) => {
            // Aplicar filtros localmente nos dados recebidos em tempo real
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
        // Estado
        appointments,
        loading,
        refreshing,
        error,
        currentFilter,

        // Ações
        loadAppointments,
        refresh,
        setStatusFilter,
        setFutureOnlyFilter,
        clearFilters,
        clearError,
    };
}
