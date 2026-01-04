import { useState, useCallback, useEffect } from "react";
import Appointment from "@/model/entities/appointment";
import { IGetAppointmentDetailsUseCase } from "@/usecase/appointment/details/iGetAppointmentDetailsUseCase";
import RepositoryError from "@/model/errors/repositoryError";
import { IGetUserByIdUseCase } from "@/usecase/user/iGetUserByIdUseCase";
import { ICancelAppointmentUseCase } from "@/usecase/appointment/status/iCancelAppointmentUseCase";
import ValidationError from "@/model/errors/validationError";
import { IAppointmentPushNotificationUseCase } from "@/usecase/notifications/iAppointmentPushNotificationUseCase";

export interface AppointmentDetailsState {
    appointment: Appointment | null;
    loading: boolean;
    processing: boolean;
    error: string | null;
    notFound: boolean;
    nutritionistName: string | null;
    nutritionistLoading: boolean;
    successMessage: string | null;
    canCancel: boolean;
}

export interface AppointmentDetailsActions {
    loadAppointment: (appointmentId: string) => Promise<void>;
    cancelAppointment: (appointmentId: string) => Promise<void>;
    clearError: () => void;
    clearSuccess: () => void;
}

export default function useAppointmentDetailsViewModel(
    getAppointmentDetailsUseCase: IGetAppointmentDetailsUseCase,
    getUserByIdUseCase?: IGetUserByIdUseCase,
    cancelAppointmentUseCase?: ICancelAppointmentUseCase,
    appointmentPushNotificationUseCase?: IAppointmentPushNotificationUseCase
): AppointmentDetailsState & AppointmentDetailsActions {
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [nutritionistName, setNutritionistName] = useState<string | null>(null);
    const [nutritionistLoading, setNutritionistLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const loadAppointment = useCallback(async (appointmentId: string): Promise<void> => {
        setLoading(true);
        setError(null);
        setNotFound(false);

        try {
            const result = await getAppointmentDetailsUseCase.getById(appointmentId);
            
            if (result === null) {
                setNotFound(true);
                setAppointment(null);
            } else {
                setAppointment(result);
            }
        } catch (err) {
            if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError('Erro ao carregar detalhes da consulta.');
            }
            setAppointment(null);
        } finally {
            setLoading(false);
        }
    }, [getAppointmentDetailsUseCase]);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    const clearSuccess = useCallback((): void => {
        setSuccessMessage(null);
    }, []);

    const cancelAppointment = useCallback(async (appointmentId: string): Promise<void> => {
        if (!cancelAppointmentUseCase) {
            setError("Cancelamento indisponível.");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const updated = await cancelAppointmentUseCase.cancelAppointment(appointmentId);
            setAppointment(updated);
            setSuccessMessage("Consulta cancelada.");
            if (appointmentPushNotificationUseCase) {
                try {
                    await appointmentPushNotificationUseCase.notify(updated, "cancelled", "nutritionist");
                } catch (error) {
                    console.warn("Falha ao enviar notificacao de cancelamento:", error);
                }
            }
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.message);
            } else if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError("Erro ao cancelar consulta.");
            }
        } finally {
            setProcessing(false);
        }
    }, [cancelAppointmentUseCase]);

    useEffect(() => {
        const nutritionistId = appointment?.nutritionistId;
        if (!nutritionistId || !getUserByIdUseCase) {
            setNutritionistName(null);
            setNutritionistLoading(false);
            return;
        }

        let isActive = true;
        setNutritionistLoading(true);
        getUserByIdUseCase.getById(nutritionistId)
            .then((user) => {
                if (!isActive) return;
                setNutritionistName(user?.name ?? "Nutricionista");
            })
            .catch(() => {
                if (!isActive) return;
                setNutritionistName("Nutricionista");
            })
            .finally(() => {
                if (!isActive) return;
                setNutritionistLoading(false);
            });

        return () => {
            isActive = false;
        };
    }, [appointment?.nutritionistId, getUserByIdUseCase]);

    const canCancel = appointment?.status === "pending" || appointment?.status === "accepted";

    return {
        appointment,
        loading,
        processing,
        error,
        notFound,
        nutritionistName,
        nutritionistLoading,
        successMessage,
        canCancel,
        loadAppointment,
        cancelAppointment,
        clearError,
        clearSuccess,
    };
}
