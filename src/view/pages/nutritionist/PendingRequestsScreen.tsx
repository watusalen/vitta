import React from "react";
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/view/themes/theme";
import { useAuthHomeViewModel, useNutritionistPendingRequestsViewModel } from "@/di/container";
import ScreenHeader from "@/view/components/ScreenHeader";
import EmptyStateCard from "@/view/components/EmptyStateCard";
import ConfirmActionModal from "@/view/components/ConfirmActionModal";
import ErrorScreen from "@/view/components/ErrorScreen";
import useRedirectEffect from "@/view/hooks/useRedirectEffect";
import PendingRequestRow from "@/view/pages/nutritionist/components/PendingRequestRow";
import usePendingRequestsUiState from "@/view/pages/nutritionist/hooks/usePendingRequestsUiState";

export default function PendingRequestsScreen() {
    const insets = useSafeAreaInsets();
    const { user, unauthenticatedRedirect, calendarPermissionRedirect } = useAuthHomeViewModel();
    const nutritionistId = user?.id || "";

    const {
        pendingAppointments,
        loading,
        processing,
        error,
        successMessage,
        acceptAppointment,
        rejectAppointment,
        clearError,
        clearSuccess,
    } = useNutritionistPendingRequestsViewModel(nutritionistId);

    const {
        modalOpen,
        modalVariant,
        selectedItem,
        showError,
        openAccept,
        openReject,
        closeModal,
        hideError,
    } = usePendingRequestsUiState(error, successMessage, clearSuccess);

    useRedirectEffect(unauthenticatedRedirect);
    useRedirectEffect(calendarPermissionRedirect);

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScreenHeader title="Solicitações Pendentes" />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    if (showError && error) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScreenHeader title="Solicitações Pendentes" />
                <ErrorScreen
                    message={error}
                    onRetry={() => {
                        hideError();
                        clearError();
                    }}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScreenHeader title="Solicitações Pendentes" />

            {pendingAppointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <EmptyStateCard
                        icon="inbox"
                        title="Nenhuma solicitação pendente"
                        subtitle="Novas solicitações aparecerão aqui"
                    />
                </View>
            ) : (
                <FlatList
                    data={pendingAppointments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PendingRequestRow
                            item={item}
                            processing={processing}
                            onAccept={openAccept}
                            onReject={openReject}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <ConfirmActionModal
                visible={modalOpen}
                variant={modalVariant}
                title={modalVariant === "accept" ? "Aceitar consulta?" : "Recusar consulta?"}
                subtitle={
                    selectedItem
                        ? `${selectedItem.patientName}\n${selectedItem.dateFormatted}, ${selectedItem.timeStart}`
                        : ""
                }
                loading={processing}
                onClose={closeModal}
                onConfirm={() => {
                    if (!selectedItem) return;
                    if (modalVariant === "accept") acceptAppointment(selectedItem.id);
                    else rejectAppointment(selectedItem.id);
                    closeModal();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
    },
});
