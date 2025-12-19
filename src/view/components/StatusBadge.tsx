import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts, spacing, fontSizes, borderRadius } from "@/view/themes/theme";
import { AppointmentStatus } from "@/model/entities/appointment";

type Variant = "filled" | "soft";

type Props = {
    status: AppointmentStatus;
    variant?: Variant;
};

function getStyle(status: AppointmentStatus, variant: Variant) {
    if (variant === "filled") {
        switch (status) {
            case "accepted":
                return { bg: "#DCE5DE", text: colors.primary, label: "Agendada" };
            case "pending":
                return { bg: colors.pending, text: colors.background, label: "Pendente" };
            case "rejected":
                return { bg: colors.error, text: colors.background, label: "Recusada" };
            case "cancelled":
                return { bg: colors.cancelled, text: colors.background, label: "Cancelada" };
        }
    }
    
    switch (status) {
        case "accepted":
            return { bg: colors.primaryLight, text: colors.primary, label: "Aceita" };
        case "pending":
            return { bg: "#FFF3E0", text: "#E65100", label: "Pendente" };
        case "rejected":
            return { bg: "#FFEBEE", text: colors.error, label: "Recusada" };
        case "cancelled":
            return { bg: "#EEEEEE", text: colors.cancelled, label: "Cancelada" };
    }
}

export default function StatusBadge({ status, variant = "filled" }: Props) {
    const s = getStyle(status, variant);

    return (
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.text, { color: s.text }]}>{s.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        alignSelf: "flex-start",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm + 6,
        borderRadius: borderRadius.full,
    },
    text: {
        fontSize: fontSizes.sm + 2,
        fontFamily: fonts.bold,
    },
});
