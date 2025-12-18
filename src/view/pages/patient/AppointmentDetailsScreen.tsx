import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

import { colors, fonts, spacing, fontSizes } from "@/view/themes/theme";
import ScreenHeader from "@/view/components/ScreenHeader";
import StatusBadge from "@/view/components/StatusBadge";
import InfoRow from "@/view/components/InfoRow";
import useAppointmentDetailsViewModel from "@/viewmodel/appointment/useAppointmentDetailsViewModel";
import { getAppointmentDetailsUseCase, userRepository } from "@/di/container";
import User from "@/model/entities/user";

function formatDayText(dateStr: string): string {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return `${days[date.getDay()]}, ${day} de ${months[month - 1]}`;
}

export default function AppointmentDetailsScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();

    const { appointment, loading, error, notFound, loadAppointment, clearError } =
        useAppointmentDetailsViewModel(getAppointmentDetailsUseCase);

    const [nutritionist, setNutritionist] = useState<User | null>(null);

    useEffect(() => {
        if (id) loadAppointment(id);
    }, [id, loadAppointment]);

    useEffect(() => {
        if (appointment?.nutritionistId) {
            userRepository.getUserByID(appointment.nutritionistId).then(setNutritionist);
        }
    }, [appointment?.nutritionistId]);

    useEffect(() => {
        if (error) Alert.alert("Erro", error, [{ text: "OK", onPress: clearError }]);
    }, [error, clearError]);

    function handleCancel() {
        Alert.alert("Cancelar Consulta", "Deseja realmente cancelar?", [
            { text: "Não", style: "cancel" },
            { text: "Sim", style: "destructive", onPress: () => console.log("Cancelar") },
        ]);
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

    const canCancel = appointment.status === "pending" || appointment.status === "accepted";

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScreenHeader title="Detalhes da Consulta" />
            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 140 }}>

                <StatusBadge status={appointment.status} variant="soft" />

                <Text style={styles.bigTitle}>{formatDayText(appointment.date)}</Text>
                <Text style={styles.bigTime}>{appointment.timeStart}</Text>

                <View style={styles.card}>
                    <InfoRow
                        icon="user"
                        title="Nutricionista"
                        subtitle={nutritionist?.name || "Carregando..."}
                    />
                    <View style={styles.divider} />
                    <InfoRow icon="map-pin" title="Local" subtitle="Consultório Vitta" />
                </View>

                {appointment.observations && (
                    <View style={styles.noteCard}>
                        <View style={styles.noteRow}>
                            <View style={styles.noteIcon}>
                                <Feather name="info" size={18} color={colors.primary} />
                            </View>
                            <Text style={styles.noteText}>{appointment.observations}</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {canCancel && (
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.cancelText}>Cancelar Consulta</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },

    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
    },

    centered: { flex: 1, alignItems: "center", justifyContent: "center" },

    emptyText: {
        fontSize: fontSizes.md,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: spacing.xxl,
    },

    bigTitle: {
        fontSize: 44,
        lineHeight: 48,
        fontFamily: fonts.bold,
        color: colors.text,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    bigTime: {
        fontSize: fontSizes.xxl - 4,
        fontFamily: fonts.bold,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },

    card: {
        backgroundColor: colors.background,
        borderRadius: 24,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.04)",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
        elevation: 1,
    },

    divider: {
        height: 1,
        backgroundColor: "rgba(0,0,0,0.06)",
        marginVertical: spacing.sm,
    },

    noteCard: {
        backgroundColor: "#E7EDED",
        borderRadius: 18,
        paddingVertical: spacing.md + 2,
        paddingHorizontal: spacing.md + 2,
        alignItems: "center",
        justifyContent: "center",
    },
    noteRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.sm,
    },
    noteIcon: {
        marginTop: 2,
    },
    noteText: {
        flex: 1,
        fontSize: fontSizes.md,
        lineHeight: 22,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        textAlign: "center",
    },

    bottomBar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        backgroundColor: colors.surface,
    },

    cancelButton: {
        height: 66,
        borderRadius: 33,
        backgroundColor: colors.error,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.10,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 14,
        elevation: 4,
    },

    cancelText: {
        color: colors.background,
        fontSize: fontSizes.lg,
        fontFamily: fonts.bold,
    },
});

