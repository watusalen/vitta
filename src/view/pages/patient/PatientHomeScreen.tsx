import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, spacing, fontSizes, borderRadius } from "@/view/themes/theme";
import { authUseCases } from "@/di/container";
import useHomeViewModel from "@/viewmodel/auth/useHomeViewModel";
import LogoutButton from "@/view/components/LogoutButton";
import { router } from "expo-router";
import { Alert } from "react-native";
import HomeCard from "@/view/components/HomeCard";

export default function PatientHomeScreen() {
    const insets = useSafeAreaInsets();
    const { user, logout } = useHomeViewModel(authUseCases);

    function handleScheduleNew() {
        router.push("/schedule");
    }

    function handleSeeAllAppointments() {
        router.push("/my-appointments");
    }

    function handleNotifications() {
        console.log("Abrir notificações");
    }

    async function handleLogout() {
        try {
            await logout();
            router.replace("/login");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <Image
                    source={require("../../assets/images/image.png")}
                    style={styles.avatar}
                />
                <Text style={styles.headerText}>Olá, {user?.name || user?.email || "Paciente"}!</Text>
                <LogoutButton onPress={handleLogout} />
            </View>

            {/* Cards */}
            <View style={styles.cardsWrapper}>
                {/* Card 1 - Solicitar Nova Consulta */}
                <HomeCard backgroundColor={colors.primaryLight} onPress={handleScheduleNew}>
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

                    <TouchableOpacity style={styles.primaryButton} onPress={handleScheduleNew}>
                        <Text style={styles.primaryButtonText}>Agendar agora</Text>
                    </TouchableOpacity>
                </HomeCard>

                {/* Card 2 - Minhas Consultas */}
                <HomeCard backgroundColor={colors.white} onPress={handleSeeAllAppointments}>
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

                    <TouchableOpacity style={styles.secondaryButton} onPress={handleSeeAllAppointments}>
                        <Text style={styles.secondaryButtonText}>Ver todas</Text>
                    </TouchableOpacity>
                </HomeCard>
            </View>
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
        fontSize: fontSizes.sm,
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
