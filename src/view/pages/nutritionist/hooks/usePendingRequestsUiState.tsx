import { useCallback, useEffect, useState } from "react";
import { PendingAppointmentItem } from "@/viewmodel/nutritionist/types/pendingRequestsViewModelTypes";

type ModalVariant = "accept" | "reject";

export default function usePendingRequestsUiState(
    error: string | null,
    successMessage: string | null,
    clearSuccess: () => void
) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalVariant, setModalVariant] = useState<ModalVariant>("accept");
    const [selectedItem, setSelectedItem] = useState<PendingAppointmentItem | null>(null);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        if (!successMessage) return;
        const timer = setTimeout(() => clearSuccess(), 2000);
        return () => clearTimeout(timer);
    }, [successMessage, clearSuccess]);

    useEffect(() => {
        if (error && !modalOpen) {
            setShowError(true);
        }
    }, [error, modalOpen]);

    const openAccept = useCallback((item: PendingAppointmentItem) => {
        setSelectedItem(item);
        setModalVariant("accept");
        setModalOpen(true);
    }, []);

    const openReject = useCallback((item: PendingAppointmentItem) => {
        setSelectedItem(item);
        setModalVariant("reject");
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
    }, []);

    const hideError = useCallback(() => {
        setShowError(false);
    }, []);

    return {
        modalOpen,
        modalVariant,
        selectedItem,
        showError,
        openAccept,
        openReject,
        closeModal,
        hideError,
    };
}
