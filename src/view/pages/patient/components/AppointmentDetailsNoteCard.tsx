import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, spacing, fontSizes } from "@/view/themes/theme";

export default function AppointmentDetailsNoteCard() {
    return (
        <View style={styles.noteCard}>
            <View style={styles.noteRow}>
                <View style={styles.noteIcon}>
                    <Feather name="info" size={18} color={colors.primary} />
                </View>
                <Text style={styles.noteText}>
                    Não se esqueça de confirmar sua presença até 24h antes da consulta e prepare seus exames recentes.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
        alignItems: "center",
        gap: spacing.sm,
    },
    noteIcon: {},
    noteText: {
        flex: 1,
        fontSize: fontSizes.md,
        lineHeight: 22,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        textAlign: "center",
    },
});
