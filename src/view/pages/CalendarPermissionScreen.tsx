import React, { useMemo, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, fontSizes, spacing, borderRadius } from "@/view/themes/theme";
import { useAuthHomeViewModel, useCalendarPermissionViewModel } from "@/di/container";
import AlertModal from "@/view/components/AlertModal";
import useRedirectEffect from "@/view/hooks/useRedirectEffect";

export default function CalendarPermissionScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthHomeViewModel();
    const [errorOpen, setErrorOpen] = useState(false);

    const {
        status,
        loading,
        error,
        requestPermission,
        openSettings,
        clearError,
    } = useCalendarPermissionViewModel();

    const successRedirect = useMemo(() => {
        if (!user) return "/login";
        return user.role === "nutritionist" ? "/nutritionist-home" : "/patient-home";
    }, [user]);

    useRedirectEffect(status === "authorized" ? successRedirect : null);

    useEffect(() => {
        if (!error) return;
        setErrorOpen(true);
    }, [error]);

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.content}>
                <View>
                    <View style={styles.logoWrapper}>
                        <Image
                            source={require("../assets/images/image.png")}
                            style={styles.logo}
                        />
                    </View>

                    <Text style={styles.title}>Permissão de calendário</Text>
                    <Text style={styles.subtitle}>
                        O Vitta precisa do seu calendário para organizar consultas e enviar lembretes.
                    </Text>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>O que fazemos com isso</Text>
                        <View style={styles.cardRow}>
                            <View style={styles.cardIcon}>
                                <Feather name="calendar" size={16} color={colors.primary} />
                            </View>
                            <Text style={styles.cardText}>Salvar consultas confirmadas no calendário.</Text>
                        </View>
                        <View style={styles.cardRow}>
                            <View style={styles.cardIcon}>
                                <Feather name="bell" size={16} color={colors.primary} />
                            </View>
                            <Text style={styles.cardText}>Ativar lembretes no horário correto.</Text>
                        </View>
                        <View style={styles.cardRowLast}>
                            <View style={styles.cardIcon}>
                                <Feather name="shield" size={16} color={colors.primary} />
                            </View>
                            <Text style={styles.cardText}>Evitar conflitos entre consultas.</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actions}>
                    {loading ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={requestPermission}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.primaryButtonText}>Permitir acesso</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={openSettings}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.secondaryButtonText}>Abrir ajustes</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <Text style={styles.hint}>
                        Se negar a permissão, o app não funciona. Você pode alterar isso em Ajustes.
                    </Text>
                </View>
            </View>

            <AlertModal
                visible={errorOpen}
                variant="error"
                title="Erro"
                message={error ?? undefined}
                onConfirm={() => {
                    setErrorOpen(false);
                    clearError();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        justifyContent: "space-between",
    },
    logoWrapper: {
        alignSelf: "center",
        width: 96,
        height: 96,
        borderRadius: 56,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.lg,
    },
    logo: {
        width: 64,
        resizeMode: "contain",
    },
    title: {
        fontSize: fontSizes.xl2,
        fontFamily: fonts.bold,
        color: colors.text,
        textAlign: "center",
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSizes.md,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        lineHeight: 22,
        textAlign: "center",
        marginBottom: spacing.lg,
    },
    card: {
        backgroundColor: colors.primaryLight,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    cardTitle: {
        fontSize: fontSizes.mdLg,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: spacing.sm,
    },
    cardRowLast: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    cardIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
    },
    cardText: {
        flex: 1,
        fontSize: fontSizes.smMd,
        fontFamily: fonts.regular,
        color: colors.text,
        lineHeight: 20,
    },
    centered: {
        alignItems: "center",
        justifyContent: "center",
    },
    actions: {
        paddingTop: spacing.lg,
    },
    primaryButton: {
        height: 64,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    primaryButtonText: {
        fontSize: fontSizes.mdLg,
        fontFamily: fonts.bold,
        color: colors.white,
    },
    secondaryButton: {
        height: 64,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        fontSize: fontSizes.mdLg,
        fontFamily: fonts.bold,
        color: colors.primary,
    },
    hint: {
        fontSize: fontSizes.smMd,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: spacing.md,
    },
});
