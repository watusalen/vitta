import React, { useEffect, useCallback, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import { colors, fonts, spacing, fontSizes } from "@/view/themes/theme";
import ScreenHeader from "@/view/components/ScreenHeader";
import ErrorScreen from "@/view/components/ErrorScreen";
import AppointmentDetailsHeader from "@/view/pages/patient/components/AppointmentDetailsHeader";
import AppointmentDetailsInfoCard from "@/view/pages/patient/components/AppointmentDetailsInfoCard";
import AppointmentDetailsNoteCard from "@/view/pages/patient/components/AppointmentDetailsNoteCard";
import AppointmentDetailsActionBar from "@/view/pages/patient/components/AppointmentDetailsActionBar";
import AppointmentDetailsModals from "@/view/pages/patient/components/AppointmentDetailsModals";
import { useAuthHomeViewModel, usePatientAppointmentDetailsViewModel } from "@/di/container";
import useRedirectEffect from "@/view/hooks/useRedirectEffect";

export default function AppointmentDetailsScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { unauthenticatedRedirect, calendarPermissionRedirect } = useAuthHomeViewModel();

    const {
        appointment,
        loading,
        processing,
        error,
        successMessage,
        notFound,
        nutritionistName,
        nutritionistLoading,
        canCancel,
        loadAppointment,
        cancelAppointment,
        clearError,
        clearSuccess,
    } = usePatientAppointmentDetailsViewModel();

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const retry = useCallback(() => {
        if (id) {
            clearError();
            loadAppointment(id);
        }
    }, [id, clearError, loadAppointment]);

    useEffect(() => {
        if (id) loadAppointment(id);
    }, [id, loadAppointment]);

    useRedirectEffect(unauthenticatedRedirect);
    useRedirectEffect(calendarPermissionRedirect);

    function handleCancel() {
        setCancelModalOpen(true);
    }

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScreenHeader title="Detalhes da Consulta" />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScreenHeader title="Detalhes da Consulta" />
                <ErrorScreen message={error} onRetry={retry} />
            </View>
        );
    }

    if (notFound || !appointment) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScreenHeader title="Detalhes da Consulta" />
                <View style={styles.content}>
                    <Text style={styles.emptyText}>Consulta não encontrada.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScreenHeader title="Detalhes da Consulta" />
            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 140 }}>
                <AppointmentDetailsHeader
                    status={appointment.status}
                    date={appointment.date}
                    timeStart={appointment.timeStart}
                />
                <AppointmentDetailsInfoCard
                    nutritionistName={nutritionistLoading ? "Carregando..." : nutritionistName || "Nutricionista"}
                />
                <AppointmentDetailsNoteCard />
            </ScrollView>

            <AppointmentDetailsActionBar
                visible={!!canCancel}
                processing={processing}
                onCancel={handleCancel}
            />
            <AppointmentDetailsModals
                confirmOpen={cancelModalOpen}
                successMessage={successMessage}
                onCloseConfirm={() => setCancelModalOpen(false)}
                onConfirmCancel={() => {
                    setCancelModalOpen(false);
                    if (appointment) {
                        cancelAppointment(appointment.id);
                    }
                }}
                onConfirmSuccess={clearSuccess}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyText: {
        fontSize: fontSizes.md,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: spacing.xxl,
    },
});
