import { useEffect, useState } from "react";

type AlertState = {
    visible: boolean;
    title: string;
    message?: string;
    variant?: "info" | "success" | "error" | "warning";
    onConfirm: () => void;
};

type Params = {
    error: string | null;
    successMessage: string | null;
    hasAppointment: boolean;
    clearError: () => void;
    clearSuccess: () => void;
};

export default function useAppointmentDetailsAlerts({
    error,
    successMessage,
    hasAppointment,
    clearError,
    clearSuccess,
}: Params): AlertState {
    const [alertState, setAlertState] = useState<AlertState>({
        visible: false,
        title: "",
        onConfirm: () => undefined,
    });

    useEffect(() => {
        if (error && hasAppointment) {
            setAlertState({
                visible: true,
                title: "Erro",
                message: error,
                variant: "error",
                onConfirm: () => {
                    clearError();
                    setAlertState(prev => ({ ...prev, visible: false }));
                },
            });
        }
    }, [error, hasAppointment, clearError]);

    useEffect(() => {
        if (successMessage) {
            setAlertState({
                visible: true,
                title: "Sucesso",
                message: successMessage,
                variant: "success",
                onConfirm: () => {
                    clearSuccess();
                    setAlertState(prev => ({ ...prev, visible: false }));
                },
            });
        }
    }, [successMessage, clearSuccess]);

    return alertState;
}
