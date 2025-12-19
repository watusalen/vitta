import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, fonts, spacing, fontSizes } from "@/view/themes/theme";

type Props = {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    rightElement?: React.ReactNode;
};

export default function ScreenHeader({ title, showBack = true, onBack, rightElement }: Props) {
    function handleBack() {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    }

    return (
        <View style={styles.header}>
            {showBack ? (
                <TouchableOpacity 
                    onPress={handleBack} 
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} />
            )}

            <Text style={styles.title}>{title}</Text>

            {rightElement || <View style={styles.placeholder} />}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        fontSize: fontSizes.xl,
        fontFamily: fonts.bold,
        color: colors.text,
    },
    placeholder: {
        width: 28,
    },
});
