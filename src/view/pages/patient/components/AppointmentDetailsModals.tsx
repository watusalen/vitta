import React from "react";
import AlertModal from "@/view/components/AlertModal";
import ConfirmActionModal from "@/view/components/ConfirmActionModal";

type Props = {
    confirmOpen: boolean;
    successMessage: string | null;
    onCloseConfirm: () => void;
    onConfirmCancel: () => void;
    onConfirmSuccess: () => void;
};

export default function AppointmentDetailsModals({
    confirmOpen,
    successMessage,
    onCloseConfirm,
    onConfirmCancel,
    onConfirmSuccess,
}: Props) {
    return (
        <>
            <ConfirmActionModal
                visible={confirmOpen}
                variant="reject"
                title="Cancelar consulta?"
                subtitle="Deseja realmente cancelar esta consulta?"
                confirmText="Cancelar"
                onClose={onCloseConfirm}
                onConfirm={onConfirmCancel}
            />
            <AlertModal
                visible={!!successMessage}
                variant="success"
                title="Consulta cancelada"
                message={successMessage ?? undefined}
                onConfirm={onConfirmSuccess}
            />
        </>
    );
}
