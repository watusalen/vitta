import { useState, useCallback } from "react";
import Appointment from "@/model/entities/appointment";
import { IGetAppointmentDetailsUseCase } from "@/usecase/appointment/details/iGetAppointmentDetailsUseCase";
import { IAcceptAppointmentUseCase } from "@/usecase/appointment/status/iAcceptAppointmentUseCase";
import { IRejectAppointmentUseCase } from "@/usecase/appointment/status/iRejectAppointmentUseCase";
import { ICancelAppointmentUseCase } from "@/usecase/appointment/status/iCancelAppointmentUseCase";
import { IReactivateAppointmentUseCase } from "@/usecase/appointment/status/iReactivateAppointmentUseCase";
import { IGetUserByIdUseCase } from "@/usecase/user/iGetUserByIdUseCase";
import { IAppointmentCalendarSyncUseCase } from "@/usecase/calendar/iAppointmentCalendarSyncUseCase";
import { IAppointmentPushNotificationUseCase } from "@/usecase/notifications/iAppointmentPushNotificationUseCase";
import RepositoryError from "@/model/errors/repositoryError";
import ValidationError from "@/model/errors/validationError";
import {
    NutritionistAppointmentDetailsActions,
    NutritionistAppointmentDetailsState,
} from "@/viewmodel/nutritionist/types/nutritionistAppointmentDetailsViewModelTypes";
export default function useNutritionistAppointmentDetailsViewModel(
    getAppointmentDetailsUseCase: IGetAppointmentDetailsUseCase,
    acceptAppointmentUseCase: IAcceptAppointmentUseCase,
    rejectAppointmentUseCase: IRejectAppointmentUseCase,
    cancelAppointmentUseCase: ICancelAppointmentUseCase,
    reactivateAppointmentUseCase: IReactivateAppointmentUseCase,
    getUserByIdUseCase: IGetUserByIdUseCase,
    calendarSyncUseCase: IAppointmentCalendarSyncUseCase,
    appointmentPushNotificationUseCase: IAppointmentPushNotificationUseCase
): NutritionistAppointmentDetailsState & NutritionistAppointmentDetailsActions {
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [patientName, setPatientName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [conflictAlertOpen, setConflictAlertOpen] = useState(false);
    const [conflictMessage, setConflictMessage] = useState<string | null>(null);
    const [navigationRoute, setNavigationRoute] = useState<string | null>(null);
    const [navigationMethod, setNavigationMethod] = useState<"replace" | "push">("replace");
    const loadAppointment = useCallback(async (appointmentId: string): Promise<void> => {
        if (!appointmentId) return;
        setLoading(true);
        setError(null);
        setConflictAlertOpen(false);
        setConflictMessage(null);
        try {
            const result = await getAppointmentDetailsUseCase.getById(appointmentId);
            if (!result) {
                setAppointment(null);
                setPatientName(null);
                setNotFound(true);
                return;
            }
            setAppointment(result);
            setNotFound(false);
            try {
                const patient = await getUserByIdUseCase.getById(result.patientId);
                setPatientName(patient?.name || "Paciente");
            } catch {
                setPatientName("Paciente");
            }
        } catch (err) {
            if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError("Erro ao carregar consulta.");
            }
        } finally {
            setLoading(false);
        }
    }, [getAppointmentDetailsUseCase, getUserByIdUseCase]);
    const acceptAppointment = useCallback(async (appointmentId: string): Promise<void> => {
        setProcessing(true);
        setError(null);
        setConflictAlertOpen(false);
        setConflictMessage(null);
        try {
            const updated = await acceptAppointmentUseCase.acceptAppointment(appointmentId);
            setAppointment(updated);
            setSuccessMessage("Consulta aceita com sucesso!");
            await calendarSyncUseCase.syncAccepted(updated, "nutritionist");
            try {
                await appointmentPushNotificationUseCase.notify(updated, "accepted", "patient");
            } catch (error) {
                console.warn("Falha ao enviar notificacao de aceite:", error);
            }
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.message);
            } else if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError("Erro ao aceitar consulta.");
            }
        } finally {
            setProcessing(false);
        }
    }, [acceptAppointmentUseCase, calendarSyncUseCase, appointmentPushNotificationUseCase]);
    const rejectAppointment = useCallback(async (appointmentId: string): Promise<void> => {
        setProcessing(true);
        setError(null);
        setConflictAlertOpen(false);
        setConflictMessage(null);
        try {
            const updated = await rejectAppointmentUseCase.rejectAppointment(appointmentId);
            setAppointment(updated);
            setSuccessMessage("Consulta recusada.");
            try {
                await appointmentPushNotificationUseCase.notify(updated, "rejected", "patient");
            } catch (error) {
                console.warn("Falha ao enviar notificacao de recusa:", error);
            }
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.message);
            } else if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError("Erro ao recusar consulta.");
            }
        } finally {
            setProcessing(false);
        }
    }, [rejectAppointmentUseCase, appointmentPushNotificationUseCase]);
    const cancelAppointment = useCallback(async (appointmentId: string): Promise<void> => {
        setProcessing(true);
        setError(null);
        setConflictAlertOpen(false);
        setConflictMessage(null);
        try {
            const updated = await cancelAppointmentUseCase.cancelAppointment(appointmentId);
            setAppointment(updated);
            setSuccessMessage("Consulta cancelada.");
            await calendarSyncUseCase.syncCancelledOrRejected(updated, "nutritionist");
            try {
                await appointmentPushNotificationUseCase.notify(updated, "cancelled", "patient");
            } catch (error) {
                console.warn("Falha ao enviar notificacao de cancelamento:", error);
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
    }, [cancelAppointmentUseCase, calendarSyncUseCase, appointmentPushNotificationUseCase]);
    const reactivateAppointment = useCallback(async (appointmentId: string): Promise<void> => {
        setProcessing(true);
        setError(null);
        setConflictAlertOpen(false);
        setConflictMessage(null);

        try {
            const updated = await reactivateAppointmentUseCase.reactivateAppointment(appointmentId);
            setAppointment(updated);
            setSuccessMessage("Consulta reativada.");
            await calendarSyncUseCase.syncAccepted(updated, "nutritionist");
            try {
                await appointmentPushNotificationUseCase.notify(updated, "reactivated", "patient");
            } catch (error) {
                console.warn("Falha ao enviar notificacao de reativacao:", error);
            }
        } catch (err) {
            if (err instanceof ValidationError) {
                const message = err.message || "";
                const normalized = message.toLowerCase();
                if (normalized.includes("conflito") || normalized.includes("consulta aceita")) {
                    setConflictMessage(
                        "Já existe uma consulta neste horário e você não pode ter duas consultas no mesmo horário. Você pode resolver o conflito."
                    );
                    setConflictAlertOpen(true);
                    return;
                }
                setError(err.message);
            } else if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError("Erro ao reativar consulta.");
            }
        } finally {
            setProcessing(false);
        }
    }, [reactivateAppointmentUseCase, calendarSyncUseCase, appointmentPushNotificationUseCase]);
    const clearError = useCallback((): void => {
        setError(null);
    }, []);
    const clearSuccess = useCallback((): void => {
        setSuccessMessage(null);
    }, []);
    const dismissConflictAlert = useCallback((): void => {
        setConflictAlertOpen(false);
    }, []);
    const resolveConflict = useCallback((appointmentId: string): void => {
        setNavigationMethod("push");
        setNavigationRoute(`/resolve-conflict/${appointmentId}`);
        setConflictAlertOpen(false);
    }, []);
    const clearNavigation = useCallback((): void => {
        setNavigationRoute(null);
    }, []);
    const canHandle = appointment?.status === "pending";
    const canCancel = appointment?.status === "accepted";
    const canReactivate = appointment?.status === "cancelled";

    return {
        appointment,
        patientName,
        loading,
        processing,
        error,
        successMessage,
        notFound,
        canHandle,
        canCancel,
        canReactivate,
        conflictAlertOpen,
        conflictMessage,
        navigationRoute,
        navigationMethod,
        loadAppointment,
        acceptAppointment,
        rejectAppointment,
        cancelAppointment,
        reactivateAppointment,
        clearError,
        clearSuccess,
        dismissConflictAlert,
        resolveConflict,
        clearNavigation,
    };
}
