import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, spacing, fontSizes, borderRadius } from "@/view/themes/theme";

type Props = {
    message: string;
    onRetry?: () => void;
};

export default function ErrorScreen({ message, onRetry }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Feather name="alert-circle" size={64} color={colors.error} />
                </View>
                
                <Text style={styles.title}>Ops! Algo deu errado</Text>
                <Text style={styles.message}>{message}</Text>

                {onRetry && (
                    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                        <Text style={styles.retryButtonText}>Tentar novamente</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.xl,
        backgroundColor: colors.background,
    },
    content: {
        alignItems: "center",
        maxWidth: 300,
    },
    iconContainer: {
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSizes.xl,
        fontFamily: fonts.bold,
        color: colors.text,
        textAlign: "center",
        marginBottom: spacing.sm,
    },
    message: {
        fontSize: fontSizes.md,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        textAlign: "center",
        marginBottom: spacing.xl,
    },
    retryButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
    },
    retryButtonText: {
        fontSize: fontSizes.md,
        fontFamily: fonts.medium,
        color: "#fff",
    },
});
