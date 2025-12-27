import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { colors, fonts, spacing, fontSizes } from "@/view/themes/theme";

type Props = {
    visible: boolean;
    processing: boolean;
    onCancel: () => void;
};

export default function AppointmentDetailsActionBar({ visible, processing, onCancel }: Props) {
    if (!visible) return null;

    return (
        <View style={styles.bottomBar}>
            <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={onCancel}
                disabled={processing}
            >
                {processing ? (
                    <ActivityIndicator color={colors.background} />
                ) : (
                    <Text style={styles.actionText}>Cancelar Consulta</Text>
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
        paddingBottom: spacing.lg,
        backgroundColor: colors.surface,
        flexDirection: "row",
        gap: spacing.md,
    },
    actionButton: {
        flex: 1,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 14,
        elevation: 4,
    },
    cancelButton: {
        backgroundColor: colors.error,
    },
    actionText: {
        color: colors.background,
        fontSize: fontSizes.lg,
        fontFamily: fonts.bold,
    },
});
