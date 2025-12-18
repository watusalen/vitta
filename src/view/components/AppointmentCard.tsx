import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, spacing, fontSizes, borderRadius } from "@/view/themes/theme";
import { AppointmentStatus } from "@/model/entities/appointment";
import StatusBadge from "./StatusBadge";

type Props = {
    date: string;
    timeStart: string;
    status: AppointmentStatus;
    onPress: () => void;
};

function formatDate(dateStr: string, timeStart: string): string {
    const [year, month, day] = dateStr.split("-").map(Number);
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];
    return `${day} de ${months[month - 1]} de ${year} às ${timeStart}`;
}

export default function AppointmentCard({ date, timeStart, status, onPress }: Props) {
    return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
            <View style={styles.topRow}>
                <Text style={styles.dateText}>{formatDate(date, timeStart)}</Text>
                <Feather name="chevron-right" size={22} color={colors.textSecondary} />
            </View>
            <StatusBadge status={status} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.xl + 2,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 2,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.sm + 6,
    },
    dateText: {
        flex: 1,
        fontSize: fontSizes.md,
        fontFamily: fonts.medium,
        color: colors.text,
        marginRight: spacing.sm,
    },
});
