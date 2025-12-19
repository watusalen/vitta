import React, { useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, spacing, fontSizes, borderRadius } from "@/view/themes/theme";
import { authUseCases, appointmentRepository, userRepository } from "@/di/container";
import useHomeViewModel from "@/viewmodel/auth/useHomeViewModel";
import useNutritionistHomeViewModel from "@/viewmodel/nutritionist/useNutritionistHomeViewModel";
import { router } from "expo-router";
import LogoutButton from "@/view/components/LogoutButton";
import HomeCard from "@/view/components/HomeCard";
import EmptyStateCard from "@/view/components/EmptyStateCard";

export default function NutritionistHomeScreen() {
    const insets = useSafeAreaInsets();
    const { user, logout } = useHomeViewModel(authUseCases);
    const nutritionistId = user?.id || "";

    const {
        todayAppointments,
        pendingCount,
        loading,
        showEmptyState,
        hasAppointmentsToday,
    } = useNutritionistHomeViewModel(
        appointmentRepository,
        userRepository,
        nutritionistId
    );

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const prevShowEmptyState = useRef(showEmptyState);

    useEffect(() => {
        if (prevShowEmptyState.current && !showEmptyState) {
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
        prevShowEmptyState.current = showEmptyState;
    }, [showEmptyState, fadeAnim]);

    function handleViewPendingRequests() {
        router.push("/pending-requests");
    }

    function handleViewAgenda() {
        router.push("/agenda");
    }

    async function handleLogout() {
        try {
            await logout();
            router.replace("/login");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
        }
    }

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <Image
                    source={require("../../assets/images/image.png")}
                    style={styles.avatar}
                />
                <Text style={styles.headerText}>Olá, {user?.name || user?.email || "Nutricionista"}!</Text>
                <LogoutButton onPress={handleLogout} />
            </View>

            {/* Cards */}
            <View style={styles.cardsWrapper}>
                {/* Card 1 - Solicitações Pendentes */}
                <HomeCard backgroundColor={colors.primaryLight} onPress={handleViewPendingRequests}>
                    <View style={styles.cardTopRow}>
                        <View style={styles.iconCircle}>
                            <Feather name="inbox" size={22} color={colors.primary} />
                        </View>

                        <View style={styles.cardTextWrapper}>
                            <Text style={styles.cardTitle}>Solicitações Pendentes</Text>
                            <Text style={styles.cardSubtitle}>
                                {pendingCount > 0
                                    ? `Você tem ${pendingCount} solicitação(ões) aguardando aprovação.`
                                    : "Nenhuma solicitação pendente no momento."}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.primaryButton} onPress={handleViewPendingRequests}>
                        <Text style={styles.primaryButtonText}>Ver solicitações</Text>
                    </TouchableOpacity>
                </HomeCard>

                {/* Card 2 - Agenda do Dia */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    {hasAppointmentsToday ? (
                        <HomeCard backgroundColor={colors.white} onPress={handleViewAgenda}>
                            <View style={styles.cardTopRow}>
                                <View style={styles.iconCircle}>
                                    <Feather name="calendar" size={22} color={colors.primary} />
                                </View>

                                <View style={styles.cardTextWrapper}>
                                    <Text style={styles.cardTitle}>Agenda de Hoje</Text>
                                    <Text style={styles.cardSubtitle}>
                                        {`Você tem ${todayAppointments.length} consulta(s) confirmada(s) hoje.`}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.appointmentsWrapper}>
                                {todayAppointments.map((item, index) => (
                                    <View key={item.id}>
                                        <View style={styles.appointmentRow}>
                                            <Text style={styles.appointmentName}>{item.patientName}</Text>
                                            <Text style={styles.appointmentTime}>{item.time}</Text>
                                        </View>
                                        {index < todayAppointments.length - 1 && (
                                            <View style={styles.divider} />
                                        )}
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity style={styles.secondaryButton} onPress={handleViewAgenda}>
                                <Text style={styles.secondaryButtonText}>Ver agenda completa</Text>
                            </TouchableOpacity>
                        </HomeCard>
                    ) : showEmptyState ? (
                        <EmptyStateCard
                            title="Sua agenda está livre hoje!"
                            subtitle="Nenhuma consulta confirmada para o dia."
                            icon="smile"
                        />
                    ) : (
                        <HomeCard backgroundColor={colors.white} onPress={handleViewAgenda}>
                            <View style={styles.cardTopRow}>
                                <View style={styles.iconCircle}>
                                    <Feather name="calendar" size={22} color={colors.primary} />
                                </View>

                                <View style={styles.cardTextWrapper}>
                                    <Text style={styles.cardTitle}>Agenda de Hoje</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Sua agenda está livre hoje!
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.secondaryButton} onPress={handleViewAgenda}>
                            <Text style={styles.secondaryButtonText}>Ver agenda completa</Text>
                        </TouchableOpacity>
                    </HomeCard>
                    )}
                </Animated.View>
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
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
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
    appointmentsWrapper: {
        marginBottom: spacing.md,
    },
    appointmentRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing.sm,
    },
    appointmentName: {
        fontSize: fontSizes.md,
        color: colors.text,
        fontFamily: fonts.regular,
    },
    appointmentTime: {
        fontSize: fontSizes.md,
        color: colors.text,
        fontFamily: fonts.regular,
    },
    divider: {
        height: 1,
        backgroundColor: colors.inputBackground,
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
