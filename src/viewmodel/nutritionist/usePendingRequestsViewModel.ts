import { useState, useCallback, useEffect } from "react";
import Appointment from "@/model/entities/appointment";
import { IAcceptAppointmentUseCase } from "@/usecase/appointment/status/iAcceptAppointmentUseCase";
import { IRejectAppointmentUseCase } from "@/usecase/appointment/status/iRejectAppointmentUseCase";
import { IListPendingAppointmentsUseCase } from "@/usecase/appointment/list/iListPendingAppointmentsUseCase";
import { IGetUserByIdUseCase } from "@/usecase/user/iGetUserByIdUseCase";
import { IAppointmentCalendarSyncUseCase } from "@/usecase/calendar/iAppointmentCalendarSyncUseCase";
import { IAppointmentPushNotificationUseCase } from "@/usecase/notifications/iAppointmentPushNotificationUseCase";
import ValidationError from "@/model/errors/validationError";
import RepositoryError from "@/model/errors/repositoryError";
import {
    PendingAppointmentItem,
    PendingRequestsActions,
    PendingRequestsState,
} from "@/viewmodel/nutritionist/types/pendingRequestsViewModelTypes";
import { formatPendingDate } from "@/viewmodel/nutritionist/helpers/pendingRequestsViewModelHelpers";
import usePatientNameCache from "@/viewmodel/nutritionist/usePatientNameCache";

export default function usePendingRequestsViewModel(
    listPendingAppointmentsUseCase: IListPendingAppointmentsUseCase,
    acceptAppointmentUseCase: IAcceptAppointmentUseCase,
    rejectAppointmentUseCase: IRejectAppointmentUseCase,
    getUserByIdUseCase: IGetUserByIdUseCase,
    calendarSyncUseCase: IAppointmentCalendarSyncUseCase,
    appointmentPushNotificationUseCase: IAppointmentPushNotificationUseCase,
    nutritionistId: string
): PendingRequestsState & PendingRequestsActions {

    const [pendingAppointments, setPendingAppointments] = useState<PendingAppointmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { getPatientName } = usePatientNameCache(getUserByIdUseCase);

    useEffect(() => {
        if (!nutritionistId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsubscribe = listPendingAppointmentsUseCase.subscribePendingByNutritionist(
            nutritionistId,
            async (appointments: Appointment[]) => {
                const items: PendingAppointmentItem[] = await Promise.all(
                    appointments.map(async (appt) => {
                        const patientName = await getPatientName(appt.patientId);
                        return {
                            id: appt.id,
                            patientId: appt.patientId,
                            patientName,
                            dateFormatted: formatPendingDate(appt.date),
                            timeStart: appt.timeStart,
                            timeEnd: appt.timeEnd,
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
    }, [nutritionistId, listPendingAppointmentsUseCase, getPatientName]);

    const acceptAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
        setProcessing(true);
        setError(null);

        try {
            const appointment = await acceptAppointmentUseCase.acceptAppointment(appointmentId);
            try {
                await calendarSyncUseCase.syncAccepted(appointment, "nutritionist");
            } catch {
                // Não bloqueia o fluxo se o calendário falhar.
            }
            try {
                await appointmentPushNotificationUseCase.notify(appointment, "accepted", "patient");
            } catch (error) {
                console.warn("Falha ao enviar notificacao de aceite:", error);
            }
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
    }, [acceptAppointmentUseCase, appointmentPushNotificationUseCase, calendarSyncUseCase]);

    const rejectAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
        setProcessing(true);
        setError(null);

        try {
            const appointment = await rejectAppointmentUseCase.rejectAppointment(appointmentId);
            try {
                await appointmentPushNotificationUseCase.notify(appointment, "rejected", "patient");
            } catch (error) {
                console.warn("Falha ao enviar notificacao de recusa:", error);
            }
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
    }, [rejectAppointmentUseCase, appointmentPushNotificationUseCase]);

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
