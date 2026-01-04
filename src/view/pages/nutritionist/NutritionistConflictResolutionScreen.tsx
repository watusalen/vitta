import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import ScreenHeader from "@/view/components/ScreenHeader";
import ErrorScreen from "@/view/components/ErrorScreen";
import AlertModal from "@/view/components/AlertModal";
import EmptyStateCard from "@/view/components/EmptyStateCard";
import { colors, fonts, fontSizes, spacing } from "@/view/themes/theme";
import { useAuthHomeViewModel, useNutritionistConflictResolutionViewModel } from "@/di/container";
import ConflictAppointmentRow from "@/view/pages/nutritionist/components/ConflictAppointmentRow";
import useRedirectEffect from "@/view/hooks/useRedirectEffect";

export default function NutritionistConflictResolutionScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { unauthenticatedRedirect, calendarPermissionRedirect } = useAuthHomeViewModel();

    const {
        appointments,
        selectedAppointmentId,
        loading,
        processing,
        error,
        successMessage,
        notFound,
        navigationRoute,
        navigationMethod,
        loadConflict,
        selectAppointment,
        resolveConflict,
        clearError,
        clearSuccess,
        clearNavigation,
    } = useNutritionistConflictResolutionViewModel();

    useEffect(() => {
        if (id) loadConflict(id);
    }, [id, loadConflict]);

    useRedirectEffect(unauthenticatedRedirect);
    useRedirectEffect(calendarPermissionRedirect);
    useRedirectEffect(navigationRoute, { method: navigationMethod, onComplete: clearNavigation });

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScreenHeader title="Resolver Conflito" />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    if (notFound) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScreenHeader title="Resolver Conflito" />
                <ErrorScreen message="Consulta não encontrada." onRetry={() => id && loadConflict(id)} />
            </View>
        );
    }

    if (error && appointments.length === 0) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScreenHeader title="Resolver Conflito" />
                <ErrorScreen
                    message={error}
                    onRetry={() => {
                        clearError();
                        if (id) loadConflict(id);
                    }}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScreenHeader title="Resolver Conflito" />

            <View style={styles.content}>
                <Text style={styles.title}>Escolha qual consulta vai vigorar</Text>
                <Text style={styles.subtitle}>
                    Só uma consulta pode ficar aceita neste horário. Selecione a consulta correta.
                </Text>

                {appointments.length === 0 ? (
                    <EmptyStateCard
                        title="Nenhuma consulta cancelada"
                        subtitle="Não há consultas canceladas para resolver conflito neste horário."
                        icon="alert-triangle"
                    />
                ) : (
                    <FlatList
                        data={appointments}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <ConflictAppointmentRow
                                selected={selectedAppointmentId === item.id}
                                patientName={item.patientName}
                                timeStart={item.timeStart}
                                timeEnd={item.timeEnd}
                                status={item.status}
                                onSelect={() => selectAppointment(item.id)}
                            />
                        )}
                    />
                )}
            </View>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.confirmButton, processing && styles.buttonDisabled]}
                    onPress={resolveConflict}
                    disabled={processing}
                    activeOpacity={0.9}
                >
                    <Text style={styles.confirmText}>
                        {processing ? "Processando..." : "Confirmar escolha"}
                    </Text>
                </TouchableOpacity>
            </View>

            <AlertModal
                visible={!!successMessage}
                variant="success"
                title="Conflito resolvido"
                message={successMessage ?? undefined}
                onConfirm={clearSuccess}
            />
            <AlertModal
                visible={!!error && appointments.length > 0}
                variant="error"
                title="Erro"
                message={error ?? undefined}
                onConfirm={clearError}
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
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    title: {
        fontSize: fontSizes.lgMd,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSizes.md,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    listContent: {
        gap: spacing.md,
        paddingBottom: spacing.xl,
    },
    bottomBar: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
    },
    confirmButton: {
        height: 54,
        borderRadius: 30,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmText: {
        fontSize: fontSizes.md,
        fontFamily: fonts.bold,
        color: colors.background,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});
