import React from "react";
import { Animated, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { borderRadius, colors, fontSizes, fonts, spacing } from "@/view/themes/theme";
import HomeCard from "@/view/components/HomeCard";
import EmptyStateCard from "@/view/components/EmptyStateCard";
import { AgendaItem } from "@/viewmodel/nutritionist/types/nutritionistHomeViewModelTypes";

type NutritionistAgendaCardProps = {
    fadeAnim: Animated.Value;
    hasAppointmentsToday: boolean;
    showEmptyState: boolean;
    todayAppointments: AgendaItem[];
    onPress: () => void;
};

export default function NutritionistAgendaCard({
    fadeAnim,
    hasAppointmentsToday,
    showEmptyState,
    todayAppointments,
    onPress,
}: NutritionistAgendaCardProps) {
    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            {hasAppointmentsToday ? (
                <HomeCard backgroundColor={colors.white} onPress={onPress}>
                    <View style={styles.cardTopRow}>
                        <View style={styles.iconCircle}>
                            <Feather name="calendar" size={22} color={colors.primary} />
                        </View>

                        <View style={styles.cardTextWrapper}>
                            <Text style={styles.cardTitle}>Agenda de Hoje</Text>
                            <Text style={styles.cardSubtitle}>
                                {`Você tem ${todayAppointments.length} consulta(s) confirmada(s) hoje.`}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.appointmentsWrapper}>
                        {todayAppointments.map((item, index) => (
                            <View key={item.id}>
                                <View style={styles.appointmentRow}>
                                    <Text style={styles.appointmentName}>{item.patientName}</Text>
                                    <Text style={styles.appointmentTime}>{item.time}</Text>
                                </View>
                                {index < todayAppointments.length - 1 && (
                                    <View style={styles.divider} />
                                )}
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.secondaryButton} onPress={onPress}>
                        <Text style={styles.secondaryButtonText}>Ver agenda completa</Text>
                    </TouchableOpacity>
                </HomeCard>
            ) : showEmptyState ? (
                <EmptyStateCard
                    title="Sua agenda está livre hoje!"
                    subtitle="Nenhuma consulta confirmada para o dia."
                    icon="smile"
                />
            ) : (
                <HomeCard backgroundColor={colors.white} onPress={onPress}>
                    <View style={styles.cardTopRow}>
                        <View style={styles.iconCircle}>
                            <Feather name="calendar" size={22} color={colors.primary} />
                        </View>

                        <View style={styles.cardTextWrapper}>
                            <Text style={styles.cardTitle}>Agenda de Hoje</Text>
                            <Text style={styles.cardSubtitle}>
                                Sua agenda está livre hoje!
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.secondaryButton} onPress={onPress}>
                        <Text style={styles.secondaryButtonText}>Ver agenda completa</Text>
                    </TouchableOpacity>
                </HomeCard>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    cardTopRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: spacing.md,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
    },
    cardTextWrapper: {
        flex: 1,
    },
    cardTitle: {
        fontSize: fontSizes.lg,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    cardSubtitle: {
        fontSize: fontSizes.smMd,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    appointmentsWrapper: {
        backgroundColor: colors.background,
        borderRadius: 18,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    appointmentRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.xs,
    },
    appointmentName: {
        fontSize: fontSizes.md,
        fontFamily: fonts.bold,
        color: colors.text,
    },
    appointmentTime: {
        fontSize: fontSizes.smMd,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(0,0,0,0.06)",
        marginVertical: spacing.xs,
    },
    secondaryButton: {
        marginTop: spacing.sm,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: borderRadius.full,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: colors.primary,
        fontSize: fontSizes.md,
        fontFamily: fonts.bold,
    },
});
