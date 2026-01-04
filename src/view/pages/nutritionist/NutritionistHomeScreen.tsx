import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/view/themes/theme";
import { useAuthHomeViewModel, useNutritionistHomeViewModel, useNutritionistCalendarSyncViewModel } from "@/di/container";
import AlertModal from "@/view/components/AlertModal";
import ConfirmActionModal from "@/view/components/ConfirmActionModal";
import useRedirectEffect from "@/view/hooks/useRedirectEffect";
import useFadeInOnToggle from "@/view/pages/nutritionist/hooks/useFadeInOnToggle";
import NutritionistHomeHeader from "@/view/pages/nutritionist/components/NutritionistHomeHeader";
import NutritionistPendingRequestsCard from "@/view/pages/nutritionist/components/NutritionistPendingRequestsCard";
import NutritionistAgendaCard from "@/view/pages/nutritionist/components/NutritionistAgendaCard";
import { router } from "expo-router";

export default function NutritionistHomeScreen() {
    const insets = useSafeAreaInsets();
    const { user, error: authError, clearError: clearAuthError, logout, unauthenticatedRedirect, calendarPermissionRedirect } = useAuthHomeViewModel();
    const nutritionistId = user?.id || "";
    const [logoutErrorOpen, setLogoutErrorOpen] = useState(false);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

    const {
        todayAppointments,
        pendingCount,
        loading,
        error: homeError,
        showEmptyState,
        hasAppointmentsToday,
        navigationRoute,
        navigationMethod,
        refresh,
        clearError: clearHomeError,
        goToPendingRequests,
        goToAgenda,
        clearNavigation,
    } = useNutritionistHomeViewModel(nutritionistId);
    useNutritionistCalendarSyncViewModel(nutritionistId);

    async function handleLogout() {
        setLogoutConfirmOpen(true);
    }

    async function confirmLogout() {
        setLogoutConfirmOpen(false);
        await logout();
        router.replace("/login");
    }

    useRedirectEffect(unauthenticatedRedirect);
    useRedirectEffect(calendarPermissionRedirect);
    useRedirectEffect(navigationRoute, { method: navigationMethod, onComplete: clearNavigation });
    const fadeAnim = useFadeInOnToggle(showEmptyState);

    useEffect(() => {
        if (!authError) return;
        setLogoutErrorOpen(true);
    }, [authError]);

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
            {/* HEADER */}
            <NutritionistHomeHeader
                name={user?.name || user?.email || "Nutricionista"}
                onLogout={handleLogout}
            />

            {/* Cards */}
            <View style={styles.cardsWrapper}>
                {/* Card 1 - Solicitações Pendentes */}
                <NutritionistPendingRequestsCard
                    pendingCount={pendingCount}
                    onPress={goToPendingRequests}
                />

                {/* Card 2 - Agenda do Dia */}
                <NutritionistAgendaCard
                    fadeAnim={fadeAnim}
                    hasAppointmentsToday={hasAppointmentsToday}
                    showEmptyState={showEmptyState}
                    todayAppointments={todayAppointments}
                    onPress={goToAgenda}
                />
            </View>
            <AlertModal
                visible={logoutErrorOpen}
                variant="error"
                title="Erro"
                message="Não foi possível sair. Tente novamente."
                onConfirm={() => {
                    setLogoutErrorOpen(false);
                    clearAuthError();
                }}
            />
            <AlertModal
                visible={!!homeError}
                variant="error"
                title="Erro"
                message={homeError ?? undefined}
                confirmText="Tentar novamente"
                onConfirm={() => {
                    clearHomeError();
                    refresh();
                }}
            />
            <ConfirmActionModal
                visible={logoutConfirmOpen}
                variant="reject"
                title="Confirmar logout"
                subtitle="Tem certeza que deseja sair da sua conta?"
                confirmText="Sair"
                onConfirm={confirmLogout}
                onClose={() => setLogoutConfirmOpen(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    cardsWrapper: {
        gap: spacing.md,
    },
});
