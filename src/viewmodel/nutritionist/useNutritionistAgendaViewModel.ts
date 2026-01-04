import { useState, useCallback, useEffect, useMemo } from "react";
import Appointment from "@/model/entities/appointment";
import { IListNutritionistAgendaUseCase } from "@/usecase/appointment/list/iListNutritionistAgendaUseCase";
import { IGetUserByIdUseCase } from "@/usecase/user/iGetUserByIdUseCase";
import RepositoryError from "@/model/errors/repositoryError";
import {
    AgendaAppointmentItem,
    AgendaFilter,
    NutritionistAgendaActions,
    NutritionistAgendaState,
} from "@/viewmodel/nutritionist/types/nutritionistAgendaViewModelTypes";
import { formatDateShort, formatSelectedDate, getDateRange } from "@/viewmodel/nutritionist/helpers/nutritionistAgendaViewModelHelpers";
import usePatientNameCache from "@/viewmodel/nutritionist/usePatientNameCache";
export default function useNutritionistAgendaViewModel(
    listNutritionistAgendaUseCase: IListNutritionistAgendaUseCase,
    getUserByIdUseCase: IGetUserByIdUseCase,
    nutritionistId: string
): NutritionistAgendaState & NutritionistAgendaActions {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [filter, setFilterState] = useState<AgendaFilter>('all');
    const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDateLoading, setSelectedDateLoading] = useState(false);
    const [navigationRoute, setNavigationRoute] = useState<string | null>(null);
    const [navigationMethod, setNavigationMethod] = useState<"replace" | "push">("replace");

    const { getPatientName } = usePatientNameCache(getUserByIdUseCase);
    const [selectedDateAppointments, setSelectedDateAppointments] = useState<AgendaAppointmentItem[]>([]);
    const loadAgenda = useCallback(async (): Promise<void> => {
        if (!nutritionistId) return;

        setError(null);

        try {
            const { start, end } = getDateRange(filter);
            const result = await listNutritionistAgendaUseCase.listAgenda(nutritionistId, start, end);
            
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
    }, [nutritionistId, filter, listNutritionistAgendaUseCase]);

    const formatAppointments = useCallback(async (appointments: Appointment[]): Promise<AgendaAppointmentItem[]> => {
        return Promise.all(
            appointments.map(async (appt) => {
                const patientName = await getPatientName(appt.patientId);
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
    }, [getPatientName]);

    const selectDate = useCallback(async (date: Date): Promise<void> => {
        setSelectedDate(date);
        setError(null);
        setSelectedDateLoading(true);

        try {
            const appointments = await listNutritionistAgendaUseCase.listAcceptedByDate(nutritionistId, date);
            const formatted = await formatAppointments(appointments);
            setSelectedDateAppointments(formatted);
        } catch (err) {
            setSelectedDateAppointments([]);
            if (err instanceof RepositoryError) {
                setError(err.message);
            }
        } finally {
            setSelectedDateLoading(false);
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

    const openAppointment = useCallback((appointmentId: string) => {
        setNavigationMethod("push");
        setNavigationRoute(`/nutritionist-appointment/${appointmentId}`);
    }, []);

    const clearNavigation = useCallback(() => {
        setNavigationRoute(null);
    }, []);

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
        selectedDateLoading,
        refreshing,
        error,
        navigationRoute,
        navigationMethod,
        selectDate,
        setFilter,
        refresh,
        retry,
        openAppointment,
        clearNavigation,
    };
}
