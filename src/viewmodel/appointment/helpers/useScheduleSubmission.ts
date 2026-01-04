import { useCallback, useState } from "react";
import Appointment from "@/model/entities/appointment";
import User from "@/model/entities/user";
import ValidationError from "@/model/errors/validationError";
import RepositoryError from "@/model/errors/repositoryError";
import { IRequestAppointmentUseCase, RequestAppointmentInput } from "@/usecase/appointment/request/iRequestAppointmentUseCase";
import TimeSlot from "@/model/entities/timeSlot";
import { IAppointmentPushNotificationUseCase } from "@/usecase/notifications/iAppointmentPushNotificationUseCase";

type Params = {
    requestAppointmentUseCase: IRequestAppointmentUseCase;
    appointmentPushNotificationUseCase: IAppointmentPushNotificationUseCase;
    selectedDate: Date | null;
    selectedSlot: TimeSlot | null;
    nutritionist: User | null;
    nutritionistLoading: boolean;
    onError: (message: string | null) => void;
    onClearSelection: () => void;
    onRefreshDate: (date: Date, nutritionistId: string, patientId?: string) => Promise<void>;
};

type SubmissionState = {
    submitting: boolean;
    successMessage: string | null;
    successRedirect: string | null;
};

type SubmissionActions = {
    requestAppointment: (patientId: string, nutritionistId: string) => Promise<Appointment | null>;
    submitAppointment: (patientId: string) => Promise<Appointment | null>;
    clearSuccess: () => void;
};

export default function useScheduleSubmission({
    requestAppointmentUseCase,
    appointmentPushNotificationUseCase,
    selectedDate,
    selectedSlot,
    nutritionist,
    nutritionistLoading,
    onError,
    onClearSelection,
    onRefreshDate,
}: Params): SubmissionState & SubmissionActions {
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [successRedirect, setSuccessRedirect] = useState<string | null>(null);

    const requestAppointment = useCallback(async (
        patientId: string,
        nutritionistId: string
    ): Promise<Appointment | null> => {
        if (!selectedDate || !selectedSlot) {
            onError("Selecione uma data e horário para continuar.");
            return null;
        }

        setSubmitting(true);
        onError(null);

        try {
            const input: RequestAppointmentInput = {
                patientId,
                nutritionistId,
                date: selectedDate,
                timeStart: selectedSlot.timeStart,
                timeEnd: selectedSlot.timeEnd,
            };

            const appointment = await requestAppointmentUseCase.requestAppointment(input);
            try {
                await appointmentPushNotificationUseCase.notify(appointment, "requested", "nutritionist");
            } catch (error) {
                console.warn("Falha ao enviar notificacao de solicitacao:", error);
            }

            setSuccessMessage("Consulta solicitada com sucesso! Aguarde a confirmação da nutricionista.");
            setSuccessRedirect("/my-appointments");
            onClearSelection();

            await onRefreshDate(selectedDate, nutritionistId, patientId);
            return appointment;
        } catch (err) {
            if (err instanceof ValidationError || err instanceof RepositoryError) {
                onError(err.message);
            } else {
                onError("Erro ao solicitar consulta. Tente novamente.");
            }
            return null;
        } finally {
            setSubmitting(false);
        }
    }, [
        selectedDate,
        selectedSlot,
        requestAppointmentUseCase,
        appointmentPushNotificationUseCase,
        onError,
        onClearSelection,
        onRefreshDate,
    ]);

    const submitAppointment = useCallback(async (patientId: string): Promise<Appointment | null> => {
        if (nutritionistLoading) {
            return null;
        }

        if (!nutritionist) {
            onError("Nutricionista nao encontrada.");
            return null;
        }

        return requestAppointment(patientId, nutritionist.id);
    }, [nutritionist, nutritionistLoading, onError, requestAppointment]);

    const clearSuccess = useCallback(() => {
        setSuccessMessage(null);
        setSuccessRedirect(null);
    }, []);

    return {
        submitting,
        successMessage,
        successRedirect,
        requestAppointment,
        submitAppointment,
        clearSuccess,
    };
}
