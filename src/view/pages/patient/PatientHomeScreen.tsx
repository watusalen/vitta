import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, fontSizes, fonts, spacing, borderRadius } from "@/view/themes/theme";
import { useAuthHomeViewModel, usePatientHomeViewModel } from "@/di/container";
import LogoutButton from "@/view/components/LogoutButton";
import HomeCard from "@/view/components/HomeCard";
import AlertModal from "@/view/components/AlertModal";
import useRedirectEffect from "@/view/hooks/useRedirectEffect";

export default function PatientHomeScreen() {
    const insets = useSafeAreaInsets();
    const { user, error, logout, clearError, unauthenticatedRedirect } = useAuthHomeViewModel();
    const [logoutErrorOpen, setLogoutErrorOpen] = useState(false);
    const { navigationRoute, navigationMethod, goToSchedule, goToAppointments, clearNavigation } = usePatientHomeViewModel();

    async function handleLogout() {
        await logout();
    }

    useRedirectEffect(unauthenticatedRedirect);
    useRedirectEffect(navigationRoute, { method: navigationMethod, onComplete: clearNavigation });

    useEffect(() => {
        if (!error) return;
        setLogoutErrorOpen(true);
    }, [error]);

    return (
        <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
            <View style={styles.header}>
                <Image
                    source={require("../../assets/images/image.png")}
                    style={styles.avatar}
                />
                <Text style={styles.headerText}>Olá, {user?.name || user?.email || "Paciente"}!</Text>
                <LogoutButton onPress={handleLogout} />
            </View>

            <View style={styles.cardsWrapper}>
                <HomeCard backgroundColor={colors.primaryLight} onPress={goToSchedule}>
                    <View style={styles.cardTopRow}>
                        <View style={styles.iconCircle}>
                            <Feather name="plus" size={22} color={colors.primary} />
                        </View>

                        <View style={styles.cardTextWrapper}>
                            <Text style={styles.cardTitle}>Solicitar Nova Consulta</Text>
                            <Text style={styles.cardSubtitle}>
                                Agende seu próximo encontro para cuidarmos da sua saúde.
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.primaryButton} onPress={goToSchedule}>
                        <Text style={styles.primaryButtonText}>Agendar agora</Text>
                    </TouchableOpacity>
                </HomeCard>

                <HomeCard backgroundColor={colors.white} onPress={goToAppointments}>
                    <View style={styles.cardTopRow}>
                        <View style={styles.iconCircle}>
                            <Feather name="calendar" size={22} color={colors.primary} />
                        </View>

                        <View style={styles.cardTextWrapper}>
                            <Text style={styles.cardTitle}>Minhas Consultas</Text>
                            <Text style={styles.cardSubtitle}>
                                Veja suas consultas agendadas e acompanhe o status.
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.secondaryButton} onPress={goToAppointments}>
                        <Text style={styles.secondaryButtonText}>Ver todas</Text>
                    </TouchableOpacity>
                </HomeCard>
            </View>
            <AlertModal
                visible={logoutErrorOpen}
                variant="error"
                title="Erro"
                message="Não foi possível sair. Tente novamente."
                onConfirm={() => {
                    setLogoutErrorOpen(false);
                    clearError();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
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
    cardsWrapper: {
        gap: spacing.md,
    },
    cardTopRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: spacing.md,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
    },
    cardTextWrapper: {
        flex: 1,
    },
    cardTitle: {
        fontSize: fontSizes.lg,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    cardSubtitle: {
        fontSize: fontSizes.smMd,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    primaryButton: {
        marginTop: spacing.xs,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: fontSizes.md,
        fontFamily: fonts.bold,
    },
    secondaryButton: {
        marginTop: spacing.sm,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: borderRadius.full,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: colors.primary,
        fontSize: fontSizes.md,
        fontFamily: fonts.bold,
    },
});
