import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fontSizes, fonts, spacing } from "@/view/themes/theme";
import { PendingAppointmentItem } from "@/viewmodel/nutritionist/types/pendingRequestsViewModelTypes";

type PendingRequestRowProps = {
    item: PendingAppointmentItem;
    processing: boolean;
    onAccept: (item: PendingAppointmentItem) => void;
    onReject: (item: PendingAppointmentItem) => void;
};

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
}

export default function PendingRequestRow({ item, processing, onAccept, onReject }: PendingRequestRowProps) {
    const initials = getInitials(item.patientName);

    return (
        <View style={styles.row}>
            <View style={styles.avatar}>
                {initials.length >= 2 ? (
                    <Text style={styles.avatarText}>{initials}</Text>
                ) : (
                    <Feather name="user" size={22} color={colors.textSecondary} />
                )}
            </View>

            <View style={styles.rowInfo}>
                <Text style={styles.patientName}>{item.patientName}</Text>
                <Text style={styles.subtitle}>
                    {item.dateFormatted}, {item.timeStart}
                </Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.iconBtn, styles.rejectBtn]}
                    onPress={() => onReject(item)}
                    disabled={processing}
                    activeOpacity={0.85}
                >
                    <Feather name="x" size={20} color={colors.error} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.iconBtn, styles.acceptBtn]}
                    onPress={() => onAccept(item)}
                    disabled={processing}
                    activeOpacity={0.85}
                >
                    <Feather name="check" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.inputBackground,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: fontSizes.mdLg,
        fontFamily: fonts.bold,
        color: colors.primary,
    },
    rowInfo: {
        flex: 1,
        justifyContent: "center",
    },
    patientName: {
        fontSize: fontSizes.mdLg,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: fontSizes.smMd,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginLeft: spacing.md,
    },
    iconBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: "center",
        justifyContent: "center",
    },
    rejectBtn: {
        backgroundColor: "rgba(217, 74, 74, 0.12)",
    },
    acceptBtn: {
        backgroundColor: "rgba(73, 132, 99, 0.12)",
    },
});
