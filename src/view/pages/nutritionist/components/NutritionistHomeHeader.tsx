import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import LogoutButton from "@/view/components/LogoutButton";
import { colors, fontSizes, fonts, spacing } from "@/view/themes/theme";

type NutritionistHomeHeaderProps = {
    name: string;
    onLogout: () => void;
};

export default function NutritionistHomeHeader({ name, onLogout }: NutritionistHomeHeaderProps) {
    return (
        <View style={styles.header}>
            <Image
                source={require("../../../assets/images/image.png")}
                style={styles.avatar}
            />
            <Text style={styles.headerText}>Olá, {name}!</Text>
            <LogoutButton onPress={onLogout} />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.xl,
        justifyContent: "space-between",
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        marginRight: spacing.md,
        backgroundColor: colors.primaryLight,
    },
    headerText: {
        flex: 1,
        fontSize: fontSizes.lg,
        color: colors.text,
        fontFamily: fonts.bold,
    },
});
