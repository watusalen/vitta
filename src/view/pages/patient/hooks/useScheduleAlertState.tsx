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
    nutritionistError: string | null;
    successMessage: string | null;
    onClearError: () => void;
    onClearNutritionistError: () => void;
    onClearSuccess: () => void;
    onConfirmSuccess: () => void;
};

export default function useScheduleAlertState({
    error,
    nutritionistError,
    successMessage,
    onClearError,
    onClearNutritionistError,
    onClearSuccess,
    onConfirmSuccess,
}: Params): AlertState {
    const [alertState, setAlertState] = useState<AlertState>({
        visible: false,
        title: "",
        onConfirm: () => undefined,
    });

    useEffect(() => {
        if (nutritionistError) {
            setAlertState({
                visible: true,
                title: "Erro",
                message: nutritionistError,
                variant: "error",
                onConfirm: () => {
                    onClearNutritionistError();
                    setAlertState(prev => ({ ...prev, visible: false }));
                },
            });
        }
    }, [nutritionistError, onClearNutritionistError]);

    useEffect(() => {
        if (error) {
            setAlertState({
                visible: true,
                title: "Erro",
                message: error,
                variant: "error",
                onConfirm: () => {
                    onClearError();
                    setAlertState(prev => ({ ...prev, visible: false }));
                },
            });
        }
    }, [error, onClearError]);

    useEffect(() => {
        if (successMessage) {
            setAlertState({
                visible: true,
                title: "Solicitação enviada",
                message: successMessage,
                variant: "success",
                onConfirm: () => {
                    onConfirmSuccess();
                    onClearSuccess();
                    setAlertState(prev => ({ ...prev, visible: false }));
                },
            });
        }
    }, [successMessage, onClearSuccess, onConfirmSuccess]);

    return alertState;
}
