import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { colors, fontSizes, fonts, spacing } from "@/view/themes/theme";

type Props = {
    submitting: boolean;
    disabled: boolean;
    paddingBottom: number;
    onSubmit: () => void;
};

export default function ScheduleBottomBar({
    submitting,
    disabled,
    paddingBottom,
    onSubmit,
}: Props) {
    return (
        <View style={[styles.bottomBar, { paddingBottom }]}>
            <TouchableOpacity
                style={[styles.submitButton, disabled && styles.submitDisabled]}
                onPress={onSubmit}
                disabled={disabled}
                activeOpacity={0.9}
            >
                {submitting ? (
                    <ActivityIndicator color={colors.background} />
                ) : (
                    <Text style={styles.submitText}>Solicitar Consulta</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    bottomBar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.06)",
    },
    submitButton: {
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 14,
        elevation: 4,
    },
    submitDisabled: { opacity: 0.6 },
    submitText: { color: colors.background, fontSize: fontSizes.lg, fontFamily: fonts.bold },
});
