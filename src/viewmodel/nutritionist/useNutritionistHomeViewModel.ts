import { useState, useEffect, useCallback } from "react";
import Appointment from "@/model/entities/appointment";
import User from "@/model/entities/user";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { IUserRepository } from "@/model/repositories/iUserRepository";
import RepositoryError from "@/model/errors/repositoryError";

export interface AgendaItem {
    id: string;
    patientName: string;
    time: string;
}

export interface NutritionistHomeState {
    todayAppointments: AgendaItem[];
    pendingCount: number;
    loading: boolean;
    error: string | null;
    showEmptyState: boolean;
    hasAppointmentsToday: boolean;
}

export interface NutritionistHomeActions {
    refresh: () => Promise<void>;
    clearError: () => void;
    dismissEmptyState: () => void;
}

function getTodayISO(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function useNutritionistHomeViewModel(
    appointmentRepository: IAppointmentRepository,
    userRepository: IUserRepository,
    nutritionistId: string
): NutritionistHomeState & NutritionistHomeActions {
    const [todayAppointments, setTodayAppointments] = useState<AgendaItem[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEmptyState, setShowEmptyState] = useState(true);

    const hasAppointmentsToday = todayAppointments.length > 0;

    const loadData = useCallback(async (): Promise<void> => {
        if (!nutritionistId) return;

        setLoading(true);
        setError(null);

        try {
            const pending = await appointmentRepository.listByStatus('pending', nutritionistId);
            setPendingCount(pending.length);

            const today = getTodayISO();
            const todayAll = await appointmentRepository.listByDate(today, nutritionistId);
            const accepted = todayAll.filter(a => a.status === 'accepted');

            const items: AgendaItem[] = await Promise.all(
                accepted.map(async (appt) => {
                    let patientName = "Paciente";
                    try {
                        const patient = await userRepository.getUserByID(appt.patientId);
                        if (patient) patientName = patient.name;
                    } catch {
                    }
                    return {
                        id: appt.id,
                        patientName,
                        time: appt.timeStart,
                    };
                })
            );

            items.sort((a, b) => a.time.localeCompare(b.time));
            setTodayAppointments(items);
        } catch (err) {
            if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError('Erro ao carregar dados.');
            }
        } finally {
            setLoading(false);
        }
    }, [appointmentRepository, userRepository, nutritionistId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const refresh = useCallback(async (): Promise<void> => {
        await loadData();
    }, [loadData]);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    const dismissEmptyState = useCallback((): void => {
        setShowEmptyState(false);
    }, []);

    // Reset showEmptyState quando appointments mudam
    useEffect(() => {
        setShowEmptyState(!hasAppointmentsToday);
    }, [hasAppointmentsToday]);

    // Auto-dismiss após 3 segundos
    useEffect(() => {
        if (!hasAppointmentsToday && showEmptyState && !loading) {
            const timer = setTimeout(() => {
                setShowEmptyState(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [hasAppointmentsToday, showEmptyState, loading]);

    return {
        todayAppointments,
        pendingCount,
        loading,
        error,
        showEmptyState,
        hasAppointmentsToday,
        refresh,
        clearError,
        dismissEmptyState,
    };
}
