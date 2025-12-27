import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import ScreenHeader from "@/view/components/ScreenHeader";
import NutritionistAppointmentDetailsState from "@/view/pages/nutritionist/components/NutritionistAppointmentDetailsState";
import NutritionistAppointmentDetailsModals from "@/view/pages/nutritionist/components/NutritionistAppointmentDetailsModals";
import useAppointmentDetailsAlerts from "@/view/pages/nutritionist/hooks/useAppointmentDetailsAlerts";
import NutritionistAppointmentDetailsHeader from "@/view/pages/nutritionist/components/NutritionistAppointmentDetailsHeader";
import NutritionistAppointmentDetailsInfoCard from "@/view/pages/nutritionist/components/NutritionistAppointmentDetailsInfoCard";
import NutritionistAppointmentDetailsActionBar from "@/view/pages/nutritionist/components/NutritionistAppointmentDetailsActionBar";
import useRedirectEffect from "@/view/hooks/useRedirectEffect";
import { useAuthHomeViewModel, useNutritionistAppointmentDetailsViewModel } from "@/di/container";
import { colors, spacing } from "@/view/themes/theme";

export default function NutritionistAppointmentDetailsScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { unauthenticatedRedirect } = useAuthHomeViewModel();

    const {
        appointment,
        patientName,
        loading,
        processing,
        error,
        successMessage,
        notFound,
        canHandle,
        canCancel,
        loadAppointment,
        acceptAppointment,
        rejectAppointment,
        cancelAppointment,
        clearError,
        clearSuccess,
    } = useNutritionistAppointmentDetailsViewModel();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmVariant, setConfirmVariant] = useState<"accept" | "reject" | "cancel">("accept");
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

    const alertState = useAppointmentDetailsAlerts({
        error,
        successMessage,
        hasAppointment: !!appointment,
        clearError,
        clearSuccess,
    });

    function handleAction(variant: "accept" | "reject" | "cancel") {
        setConfirmVariant(variant);
        setConfirmOpen(true);
    }

    if (loading || (error && !appointment) || notFound || !appointment) {
        return (
            <NutritionistAppointmentDetailsState
                loading={loading}
                error={error}
                notFound={notFound}
                hasAppointment={!!appointment}
                paddingTop={insets.top}
                onRetry={retry}
            />
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScreenHeader title="Detalhes da Consulta" />

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 140 }}>
                <NutritionistAppointmentDetailsHeader
                    status={appointment.status}
                    date={appointment.date}
                    timeStart={appointment.timeStart}
                />
                <NutritionistAppointmentDetailsInfoCard patientName={patientName || "Paciente"} />

            </ScrollView>

            <NutritionistAppointmentDetailsActionBar
                canHandle={!!canHandle}
                canCancel={!!canCancel}
                processing={processing}
                confirmVariant={confirmVariant}
                onAccept={() => handleAction("accept")}
                onReject={() => handleAction("reject")}
                onCancel={() => handleAction("cancel")}
            />

            <NutritionistAppointmentDetailsModals
                confirmOpen={confirmOpen}
                confirmVariant={confirmVariant}
                processing={processing}
                patientName={patientName || "Paciente"}
                appointmentDate={appointment.date}
                appointmentTime={appointment.timeStart}
                alertState={alertState}
                onCloseConfirm={() => setConfirmOpen(false)}
                onConfirm={() => {
                    if (!id) return;
                    if (confirmVariant === "accept") acceptAppointment(id);
                    else if (confirmVariant === "reject") rejectAppointment(id);
                    else cancelAppointment(id);
                    setConfirmOpen(false);
                }}
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
});
