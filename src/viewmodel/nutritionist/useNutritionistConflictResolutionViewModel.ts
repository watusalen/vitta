import { useCallback, useState } from "react";
import Appointment from "@/model/entities/appointment";
import RepositoryError from "@/model/errors/repositoryError";
import ValidationError from "@/model/errors/validationError";
import { IGetAppointmentDetailsUseCase } from "@/usecase/appointment/details/iGetAppointmentDetailsUseCase";
import { IListAppointmentConflictsUseCase } from "@/usecase/appointment/list/iListAppointmentConflictsUseCase";
import { IResolveAppointmentConflictUseCase } from "@/usecase/appointment/status/iResolveAppointmentConflictUseCase";
import { IGetUserByIdUseCase } from "@/usecase/user/iGetUserByIdUseCase";
import { IAppointmentCalendarSyncUseCase } from "@/usecase/calendar/iAppointmentCalendarSyncUseCase";
import { IAppointmentPushNotificationUseCase } from "@/usecase/notifications/iAppointmentPushNotificationUseCase";
import usePatientNameCache from "@/viewmodel/nutritionist/usePatientNameCache";
import {
    ConflictAppointmentItem,
    NutritionistConflictResolutionActions,
    NutritionistConflictResolutionState,
} from "@/viewmodel/nutritionist/types/nutritionistConflictResolutionViewModelTypes";
import { formatDateShort } from "@/viewmodel/nutritionist/helpers/nutritionistAgendaViewModelHelpers";

export default function useNutritionistConflictResolutionViewModel(
    getAppointmentDetailsUseCase: IGetAppointmentDetailsUseCase,
    listAppointmentConflictsUseCase: IListAppointmentConflictsUseCase,
    resolveAppointmentConflictUseCase: IResolveAppointmentConflictUseCase,
    getUserByIdUseCase: IGetUserByIdUseCase,
    calendarSyncUseCase: IAppointmentCalendarSyncUseCase,
    appointmentPushNotificationUseCase: IAppointmentPushNotificationUseCase
): NutritionistConflictResolutionState & NutritionistConflictResolutionActions {
    const [appointments, setAppointments] = useState<ConflictAppointmentItem[]>([]);
    const [rawAppointments, setRawAppointments] = useState<Appointment[]>([]);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [pendingNavigation, setPendingNavigation] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [navigationRoute, setNavigationRoute] = useState<string | null>(null);
    const [navigationMethod, setNavigationMethod] = useState<"replace" | "push">("replace");

    const { getPatientName } = usePatientNameCache(getUserByIdUseCase);

    const loadConflict = useCallback(async (appointmentId: string): Promise<void> => {
        if (!appointmentId) return;

        setLoading(true);
        setError(null);
        setNotFound(false);

        try {
            const appointment = await getAppointmentDetailsUseCase.getById(appointmentId);
            if (!appointment) {
                setNotFound(true);
                setAppointments([]);
                setRawAppointments([]);
                setSelectedAppointmentId(null);
                return;
            }

            const conflicts = await listAppointmentConflictsUseCase.listConflictsBySlot(
                appointment.nutritionistId,
                appointment.date,
                appointment.timeStart,
                appointment.timeEnd
            );

            const filteredConflicts = conflicts.filter(
                (appt): appt is Appointment & { status: "accepted" | "cancelled" } =>
                    appt.status === "accepted" || appt.status === "cancelled"
            );

            const items: ConflictAppointmentItem[] = await Promise.all(
                filteredConflicts.map(async (appt) => ({
                    id: appt.id,
                    patientName: await getPatientName(appt.patientId),
                    date: appt.date,
                    timeStart: appt.timeStart,
                    timeEnd: appt.timeEnd,
                    status: appt.status,
                }))
            );

            setAppointments(items);
            setRawAppointments(filteredConflicts);
            setSelectedAppointmentId(appointment.id);
        } catch (err) {
            if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError("Erro ao carregar conflitos.");
            }
            setRawAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [getAppointmentDetailsUseCase, listAppointmentConflictsUseCase, getPatientName]);

    const selectAppointment = useCallback((appointmentId: string) => {
        setSelectedAppointmentId(appointmentId);
    }, []);

    const resolveConflict = useCallback(async (): Promise<void> => {
        if (!selectedAppointmentId) {
            setError("Selecione uma consulta para continuar.");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const selectedBefore = rawAppointments.find(appt => appt.id === selectedAppointmentId);
            const acceptedOthers = rawAppointments.filter(
                appt => appt.id !== selectedAppointmentId && appt.status === "accepted"
            );
            await resolveAppointmentConflictUseCase.resolveConflict(selectedAppointmentId);
            await Promise.all(
                rawAppointments.map(async (appt) => {
                    if (appt.id === selectedAppointmentId) {
                        await calendarSyncUseCase.syncAccepted(appt, "nutritionist");
                        return;
                    }
                    await calendarSyncUseCase.syncCancelledOrRejected(appt, "nutritionist");
                })
            );
            if (selectedBefore && selectedBefore.status !== "accepted") {
                try {
                    await appointmentPushNotificationUseCase.notify(selectedBefore, "accepted", "patient");
                } catch (error) {
                    console.warn("Falha ao enviar notificacao de aceite:", error);
                }
            }
            await Promise.all(
                acceptedOthers.map(async (appt) => {
                    try {
                        await appointmentPushNotificationUseCase.notify(appt, "cancelled", "patient");
                    } catch (error) {
                        console.warn("Falha ao enviar notificacao de cancelamento:", error);
                    }
                })
            );
            const selected = appointments.find(item => item.id === selectedAppointmentId);
            const dateLabel = selected ? formatDateShort(selected.date) : "data escolhida";
            const timeLabel = selected?.timeStart ?? "";
            const patientLabel = selected?.patientName ?? "Paciente";

            setSuccessMessage(
                `Consulta de ${patientLabel} confirmada para ${dateLabel}${timeLabel ? ` às ${timeLabel}` : ""}.`
            );
            setPendingNavigation(true);
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.message);
            } else if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError("Erro ao resolver conflito.");
            }
        } finally {
            setProcessing(false);
        }
    }, [
        selectedAppointmentId,
        rawAppointments,
        appointments,
        resolveAppointmentConflictUseCase,
        calendarSyncUseCase,
        appointmentPushNotificationUseCase,
    ]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const clearSuccess = useCallback(() => {
        setSuccessMessage(null);
        if (pendingNavigation) {
            setPendingNavigation(false);
            setNavigationMethod("replace");
            setNavigationRoute("/agenda");
        }
    }, [pendingNavigation]);

    const clearNavigation = useCallback(() => {
        setNavigationRoute(null);
    }, []);

    return {
        appointments,
        selectedAppointmentId,
        loading,
        processing,
        error,
        successMessage,
        notFound,
        navigationRoute,
        navigationMethod,
        loadConflict,
        selectAppointment,
        resolveConflict,
        clearError,
        clearSuccess,
        clearNavigation,
    };
}
