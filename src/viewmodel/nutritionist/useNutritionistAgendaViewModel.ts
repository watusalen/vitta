import { useState, useCallback, useEffect, useMemo } from "react";
import Appointment from "@/model/entities/appointment";
import { IListNutritionistAgendaUseCase, AgendaByDate } from "@/usecase/appointment/listNutritionistAgendaUseCase";
import { IUserRepository } from "@/model/repositories/iUserRepository";
import RepositoryError from "@/model/errors/repositoryError";

export type AgendaFilter = 'all' | 'today' | 'week';

export interface AgendaAppointmentItem {
    id: string;
    patientName: string;
    date: string;
    dateFormatted: string;
    timeStart: string;
    timeEnd: string;
    status: Appointment['status'];
}

export interface NutritionistAgendaState {
    selectedDateAppointments: AgendaAppointmentItem[];
    selectedDateFormatted: string;
    selectedDate: Date | null;
    filter: AgendaFilter;
    markedDates: Set<string>;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
}

export interface NutritionistAgendaActions {
    selectDate: (date: Date) => Promise<void>;
    setFilter: (filter: AgendaFilter) => void;
    refresh: () => Promise<void>;
    retry: () => Promise<void>;
}

function formatDateShort(dateStr: string): string {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

function formatSelectedDate(date: Date | null): string {
    if (!date) return "";
    return date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

export default function useNutritionistAgendaViewModel(
    listNutritionistAgendaUseCase: IListNutritionistAgendaUseCase,
    userRepository: IUserRepository,
    nutritionistId: string
): NutritionistAgendaState & NutritionistAgendaActions {
    const [agenda, setAgenda] = useState<AgendaByDate[]>([]);
    const [rawSelectedAppointments, setRawSelectedAppointments] = useState<Appointment[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [filter, setFilterState] = useState<AgendaFilter>('all');
    const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [patientNamesCache, setPatientNamesCache] = useState<Record<string, string>>({});
    
    const [selectedDateAppointments, setSelectedDateAppointments] = useState<AgendaAppointmentItem[]>([]);

    const loadPatientName = useCallback(async (patientId: string): Promise<string> => {
        if (patientNamesCache[patientId]) {
            return patientNamesCache[patientId];
        }
        try {
            const patient = await userRepository.getUserByID(patientId);
            const name = patient?.name || "Paciente";
            setPatientNamesCache(prev => ({ ...prev, [patientId]: name }));
            return name;
        } catch {
            return "Paciente";
        }
    }, [userRepository, patientNamesCache]);

    const getDateRange = useCallback((filterType: AgendaFilter): { start: Date; end: Date } => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filterType) {
            case 'today':
                return { start: today, end: today };
            case 'week': {
                const dayOfWeek = today.getDay();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - dayOfWeek);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                return { start: startOfWeek, end: endOfWeek };
            }
            case 'all':
            default: {
                const endDate = new Date(today);
                endDate.setDate(today.getDate() + 60);
                return { start: today, end: endDate };
            }
        }
    }, []);

    const loadAgenda = useCallback(async (): Promise<void> => {
        if (!nutritionistId) return;

        setError(null);

        try {
            const { start, end } = getDateRange(filter);
            const result = await listNutritionistAgendaUseCase.execute(nutritionistId, start, end);
            
            setAgenda(result);

            const dates = new Set<string>();
            for (const item of result) {
                dates.add(item.date);
            }
            setMarkedDates(dates);
        } catch (err) {
            if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError('Erro ao carregar agenda.');
            }
        } finally {
            setInitialLoading(false);
        }
    }, [nutritionistId, filter, getDateRange, listNutritionistAgendaUseCase]);

    const formatAppointments = useCallback(async (appointments: Appointment[]): Promise<AgendaAppointmentItem[]> => {
        return Promise.all(
            appointments.map(async (appt) => {
                const patientName = await loadPatientName(appt.patientId);
                return {
                    id: appt.id,
                    patientName,
                    date: appt.date,
                    dateFormatted: formatDateShort(appt.date),
                    timeStart: appt.timeStart,
                    timeEnd: appt.timeEnd,
                    status: appt.status,
                };
            })
        );
    }, [loadPatientName]);

    const selectDate = useCallback(async (date: Date): Promise<void> => {
        setSelectedDate(date);

        try {
            const appointments = await listNutritionistAgendaUseCase.executeByDate(nutritionistId, date);
            setRawSelectedAppointments(appointments);
            
            const formatted = await formatAppointments(appointments);
            setSelectedDateAppointments(formatted);
        } catch (err) {
            setRawSelectedAppointments([]);
            setSelectedDateAppointments([]);
            if (err instanceof RepositoryError) {
                setError(err.message);
            }
        }
    }, [nutritionistId, listNutritionistAgendaUseCase, formatAppointments]);

    const setFilter = useCallback((newFilter: AgendaFilter): void => {
        setFilterState(newFilter);
    }, []);

    const refresh = useCallback(async (): Promise<void> => {
        setRefreshing(true);
        await loadAgenda();
        if (selectedDate) {
            await selectDate(selectedDate);
        }
        setRefreshing(false);
    }, [loadAgenda, selectedDate, selectDate]);

    const retry = useCallback(async (): Promise<void> => {
        setError(null);
        setInitialLoading(true);
        await loadAgenda();
    }, [loadAgenda]);

    const selectedDateFormatted = useMemo(() => {
        return formatSelectedDate(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        loadAgenda();
    }, [loadAgenda]);

    return {
        selectedDateAppointments,
        selectedDateFormatted,
        selectedDate,
        filter,
        markedDates,
        loading: initialLoading,
        refreshing,
        error,
        selectDate,
        setFilter,
        refresh,
        retry,
    };
}
