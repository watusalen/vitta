import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { borderRadius, colors, fontSizes, fonts, spacing } from "@/view/themes/theme";
import HomeCard from "@/view/components/HomeCard";

type NutritionistPendingRequestsCardProps = {
    pendingCount: number;
    onPress: () => void;
};

export default function NutritionistPendingRequestsCard({ pendingCount, onPress }: NutritionistPendingRequestsCardProps) {
    return (
        <HomeCard backgroundColor={colors.primaryLight} onPress={onPress}>
            <View style={styles.cardTopRow}>
                <View style={styles.iconCircle}>
                    <Feather name="inbox" size={22} color={colors.primary} />
                </View>

                <View style={styles.cardTextWrapper}>
                    <Text style={styles.cardTitle}>Solicitações Pendentes</Text>
                    <Text style={styles.cardSubtitle}>
                        {pendingCount > 0
                            ? `Você tem ${pendingCount} solicitação(ões) aguardando aprovação.`
                            : "Nenhuma solicitação pendente no momento."}
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={onPress}>
                <Text style={styles.primaryButtonText}>Ver solicitações</Text>
            </TouchableOpacity>
        </HomeCard>
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
    primaryButton: {
        marginTop: spacing.xs,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: fontSizes.md,
        fontFamily: fonts.bold,
    },
});
