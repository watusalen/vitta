import React from "react";
import AlertModal from "@/view/components/AlertModal";
import ConfirmActionModal from "@/view/components/ConfirmActionModal";
import { formatDayText } from "@/view/utils/dateFormatters";

type ConfirmVariant = "accept" | "reject" | "cancel" | "reactivate";

type AlertState = {
    visible: boolean;
    title: string;
    message?: string;
    variant?: "info" | "success" | "error" | "warning";
    onConfirm: () => void;
};

type Props = {
    confirmOpen: boolean;
    confirmVariant: ConfirmVariant;
    processing: boolean;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    conflictOpen: boolean;
    conflictMessage: string | null;
    alertState: AlertState;
    onCloseConfirm: () => void;
    onConfirm: () => void;
    onCloseConflict: () => void;
    onResolveConflict: () => void;
};

export default function NutritionistAppointmentDetailsModals({
    confirmOpen,
    confirmVariant,
    processing,
    patientName,
    appointmentDate,
    appointmentTime,
    conflictOpen,
    conflictMessage,
    alertState,
    onCloseConfirm,
    onConfirm,
    onCloseConflict,
    onResolveConflict,
}: Props) {
    const title =
        confirmVariant === "accept"
            ? "Aceitar consulta?"
            : confirmVariant === "reject"
            ? "Recusar consulta?"
            : confirmVariant === "reactivate"
            ? "Aceitar consulta novamente?"
            : "Cancelar consulta?";
    const confirmText =
        confirmVariant === "accept"
            ? "Aceitar"
            : confirmVariant === "reject"
            ? "Recusar"
            : confirmVariant === "reactivate"
            ? "Aceitar"
            : "Cancelar";
    const subtitle = `${patientName}\n${formatDayText(appointmentDate)}, ${appointmentTime}`;

    return (
        <>
            <ConfirmActionModal
                visible={confirmOpen}
                variant={confirmVariant === "reject" || confirmVariant === "cancel" ? "reject" : "accept"}
                title={title}
                subtitle={subtitle}
                confirmText={confirmText}
                loading={processing}
                onClose={onCloseConfirm}
                onConfirm={onConfirm}
            />
            <ConfirmActionModal
                visible={conflictOpen}
                variant="reject"
                title="Conflito de horário"
                subtitle={conflictMessage ?? undefined}
                confirmText="Resolver conflito"
                cancelText="Cancelar"
                loading={processing}
                onClose={onCloseConflict}
                onConfirm={onResolveConflict}
            />
            <AlertModal
                visible={alertState.visible}
                variant={alertState.variant}
                title={alertState.title}
                message={alertState.message}
                onConfirm={alertState.onConfirm}
            />
        </>
    );
}
