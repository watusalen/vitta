import React from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, spacing, fontSizes } from "@/view/themes/theme";
import ScreenHeader from "@/view/components/ScreenHeader";
import AppointmentCard from "@/view/components/AppointmentCard";
import AlertModal from "@/view/components/AlertModal";
import { useAuthHomeViewModel, usePatientAppointmentsViewModel } from "@/di/container";
import useRedirectEffect from "@/view/hooks/useRedirectEffect";

export default function MyAppointmentsScreen() {
    const insets = useSafeAreaInsets();
    const { user, unauthenticatedRedirect, calendarPermissionRedirect } = useAuthHomeViewModel();
    const patientId = user?.id || "";

    const {
        appointments,
        loading: appointmentsLoading,
        refreshing,
        error,
        navigationRoute,
        navigationMethod,
        refresh,
        clearError,
        loadAppointments,
        openAppointment,
        goBack,
        clearNavigation,
    } = usePatientAppointmentsViewModel(patientId);

    useRedirectEffect(unauthenticatedRedirect);
    useRedirectEffect(calendarPermissionRedirect);
    useRedirectEffect(navigationRoute, { method: navigationMethod, onComplete: clearNavigation });

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScreenHeader title="Minhas Consultas" onBack={goBack} />

            {appointmentsLoading && !refreshing ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : appointments.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>Nenhuma consulta encontrada.</Text>
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={styles.list}
                    data={appointments}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                    onRefresh={refresh}
                    refreshing={refreshing}
                    renderItem={({ item }) => (
                        <AppointmentCard
                            date={item.date}
                            timeStart={item.timeStart}
                            status={item.status}
                            onPress={() => openAppointment(item.id)}
                        />
                    )}
                />
            )}
            <AlertModal
                visible={!!error}
                variant="error"
                title="Erro"
                message={error ?? undefined}
                confirmText="Tentar novamente"
                onConfirm={() => {
                    clearError();
                    loadAppointments();
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
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.xxl,
    },
    emptyText: {
        fontSize: fontSizes.md,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        textAlign: "center",
    },
    list: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
    },
});
