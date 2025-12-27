import React from "react";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import ScreenHeader from "@/view/components/ScreenHeader";
import ErrorScreen from "@/view/components/ErrorScreen";
import { colors, fontSizes, fonts, spacing } from "@/view/themes/theme";

type Props = {
    loading: boolean;
    error: string | null;
    notFound: boolean;
    hasAppointment: boolean;
    paddingTop: number;
    onRetry: () => void;
};

export default function NutritionistAppointmentDetailsState({
    loading,
    error,
    notFound,
    hasAppointment,
    paddingTop,
    onRetry,
}: Props) {
    if (loading) {
        return (
            <View style={[styles.container, { paddingTop }]}>
                <ScreenHeader title="Detalhes da Consulta" />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    if (error && !hasAppointment) {
        return (
            <View style={[styles.container, { paddingTop }]}>
                <ScreenHeader title="Detalhes da Consulta" />
                <ErrorScreen message={error} onRetry={onRetry} />
            </View>
        );
    }

    if (notFound || !hasAppointment) {
        return (
            <View style={[styles.container, { paddingTop }]}>
                <ScreenHeader title="Detalhes da Consulta" />
                <View style={styles.content}>
                    <Text style={styles.emptyText}>Consulta não encontrada.</Text>
                </View>
            </View>
        );
    }

    return null;
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
