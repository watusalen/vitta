import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, spacing, fontSizes } from "@/view/themes/theme";

type Props = {
    icon: keyof typeof Feather.glyphMap;
    title: string;
    subtitle: string;
};

export default function InfoRow({ icon, title, subtitle }: Props) {
    return (
        <View style={styles.row}>
            <View style={styles.iconCircle}>
                <Feather name={icon} size={22} color={colors.textSecondary} />
            </View>
            <View style={styles.textWrap}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm + 6,
        paddingVertical: spacing.sm,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.inputBackground,
        alignItems: "center",
        justifyContent: "center",
    },
    textWrap: {
        flex: 1,
    },
    title: {
        fontSize: fontSizes.mdLg,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSizes.md,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
    },
});
