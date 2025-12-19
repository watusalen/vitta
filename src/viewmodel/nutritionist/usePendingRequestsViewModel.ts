import { useState, useCallback, useEffect } from "react";
import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { IAcceptAppointmentUseCase } from "@/usecase/appointment/acceptAppointmentUseCase";
import { IRejectAppointmentUseCase } from "@/usecase/appointment/rejectAppointmentUseCase";
import { IUserRepository } from "@/model/repositories/iUserRepository";
import ValidationError from "@/model/errors/validationError";
import RepositoryError from "@/model/errors/repositoryError";

export interface PendingAppointmentItem {
    id: string;
    patientId: string;
    patientName: string;
    dateFormatted: string;
    timeStart: string;
    timeEnd: string;
    observations?: string;
}

export interface PendingRequestsState {
    pendingAppointments: PendingAppointmentItem[];
    loading: boolean;
    processing: boolean;
    error: string | null;
    successMessage: string | null;
}

export interface PendingRequestsActions {
    acceptAppointment: (appointmentId: string) => Promise<boolean>;
    rejectAppointment: (appointmentId: string) => Promise<boolean>;
    clearError: () => void;
    clearSuccess: () => void;
}

function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

export default function usePendingRequestsViewModel(
    appointmentRepository: IAppointmentRepository,
    acceptAppointmentUseCase: IAcceptAppointmentUseCase,
    rejectAppointmentUseCase: IRejectAppointmentUseCase,
    userRepository: IUserRepository,
    nutritionistId: string
): PendingRequestsState & PendingRequestsActions {

    const [pendingAppointments, setPendingAppointments] = useState<PendingAppointmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [patientNamesCache, setPatientNamesCache] = useState<Record<string, string>>({});

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

    useEffect(() => {
        if (!nutritionistId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsubscribe = appointmentRepository.onNutritionistPendingChange(
            nutritionistId,
            async (appointments: Appointment[]) => {
                const items: PendingAppointmentItem[] = await Promise.all(
                    appointments.map(async (appt) => {
                        const patientName = await loadPatientName(appt.patientId);
                        return {
                            id: appt.id,
                            patientId: appt.patientId,
                            patientName,
                            dateFormatted: formatDate(appt.date),
                            timeStart: appt.timeStart,
                            timeEnd: appt.timeEnd,
                            observations: appt.observations,
                        };
                    })
                );
                setPendingAppointments(items);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [nutritionistId, appointmentRepository, loadPatientName]);

    const acceptAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
        setProcessing(true);
        setError(null);

        try {
            await acceptAppointmentUseCase.execute(appointmentId);
            setSuccessMessage('Consulta aceita com sucesso!');
            return true;
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.message);
            } else if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError('Erro ao aceitar consulta. Tente novamente.');
            }
            return false;
        } finally {
            setProcessing(false);
        }
    }, [acceptAppointmentUseCase]);

    const rejectAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
        setProcessing(true);
        setError(null);

        try {
            await rejectAppointmentUseCase.execute(appointmentId);
            setSuccessMessage('Consulta recusada.');
            return true;
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.message);
            } else if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError('Erro ao recusar consulta. Tente novamente.');
            }
            return false;
        } finally {
            setProcessing(false);
        }
    }, [rejectAppointmentUseCase]);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    const clearSuccess = useCallback((): void => {
        setSuccessMessage(null);
    }, []);

    return {
        pendingAppointments,
        loading,
        processing,
        error,
        successMessage,
        acceptAppointment,
        rejectAppointment,
        clearError,
        clearSuccess,
    };
}
