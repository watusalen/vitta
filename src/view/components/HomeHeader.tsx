import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import LogoutButton from "@/view/components/LogoutButton";
import { colors, fontSizes, fonts, spacing } from "@/view/themes/theme";

type HomeHeaderProps = {
    name: string;
    onLogout: () => void;
    onProfilePress?: () => void;
};

export default function HomeHeader({ name, onLogout, onProfilePress }: HomeHeaderProps) {
    return (
        <View style={styles.header}>
            <Image
                source={require("../assets/images/image.png")}
                style={styles.avatar}
            />
            <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8} style={styles.nameWrapper}>
                <Text style={styles.headerText} maxFontSizeMultiplier={1.2}>
                    Olá, {name}!
                </Text>
            </TouchableOpacity>
            <View style={styles.logoutButton}>
                <LogoutButton onPress={onLogout} />
            </View>
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
        fontSize: fontSizes.lg,
        color: colors.text,
        fontFamily: fonts.bold,
        textAlign: "left",
    },
    nameWrapper: {
        flex: 1,
    },
    logoutButton: {
        marginLeft: spacing.md,
    },
});
