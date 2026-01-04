import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fontSizes, fonts, spacing, borderRadius } from "@/view/themes/theme";
import StatusBadge from "@/view/components/StatusBadge";

type Props = {
    selected: boolean;
    patientName: string;
    timeStart: string;
    timeEnd: string;
    status: "accepted" | "cancelled";
    onSelect: () => void;
};

export default function ConflictAppointmentRow({
    selected,
    patientName,
    timeStart,
    timeEnd,
    status,
    onSelect,
}: Props) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onSelect}
            style={[styles.card, selected && styles.cardSelected]}
        >
            <View style={styles.topRow}>
                <View style={styles.radio}>
                    {selected && <View style={styles.radioDot} />}
                </View>
                <View style={styles.textGroup}>
                    <Text style={styles.nameText}>{patientName}</Text>
                    <Text style={styles.timeText}>{`${timeStart} - ${timeEnd}`}</Text>
                </View>
                <Feather name="check" size={18} color={selected ? colors.primary : "transparent"} />
            </View>
            <StatusBadge status={status} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.xl + 2,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 2,
    },
    cardSelected: {
        borderColor: colors.primary,
        shadowOpacity: 0.12,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.sm,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.sm,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    textGroup: {
        flex: 1,
    },
    nameText: {
        fontSize: fontSizes.md,
        fontFamily: fonts.medium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    timeText: {
        fontSize: fontSizes.sm,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
    },
});
