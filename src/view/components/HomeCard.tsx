import React, { ReactNode } from "react";
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors, spacing, borderRadius } from "@/view/themes/theme";

type HomeCardProps = {
    children: ReactNode;
    backgroundColor?: string;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    testID?: string;
};

export default function HomeCard({
    children,
    backgroundColor = colors.white,
    style,
    onPress,
    testID,
}: HomeCardProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            testID={testID}
            style={[styles.card, { backgroundColor }, style]}
        >
            {children}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        shadowColor: "#0F1D1A",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 18,
        elevation: 6,
    },
});
