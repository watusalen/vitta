import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, spacing, fontSizes, borderRadius } from "@/view/themes/theme";
import { authUseCases } from "@/di/container";
import useHomeViewModel from "@/viewmodel/useHomeViewModel";
import { router } from "expo-router";
import LogoutButton from "@/view/components/LogoutButton";
import HomeCard from "@/view/components/HomeCard";

// TODO: Buscar consultas confirmadas do backend
const APPOINTMENTS = [
    { id: "1", name: "Mariana Costa", time: "14:00" },
    { id: "2", name: "João Pedro Alves", time: "15:00" },
    { id: "3", name: "Camila Souza", time: "16:30" },
];

export default function NutritionistHomeScreen() {
    const insets = useSafeAreaInsets();
    const { user, logout } = useHomeViewModel(authUseCases);

    // TODO: Buscar número de solicitações pendentes
    const pendingCount = 2;
    const hasAppointmentsToday = APPOINTMENTS.length > 0;

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
                <Text style={styles.headerText}>Olá, {user?.name || user?.email || "Nutricionista"}!</Text>
                <LogoutButton onPress={handleLogout} />
            </View>

            {/* CARD - SOLICITAÇÕES PENDENTES */}
            <HomeCard
                backgroundColor="#E7E5D9"
                style={styles.cardSpacing}
                onPress={() => console.log("Ver todas as solicitações")}
            >
                <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>Solicitações Pendentes</Text>
                    <View style={styles.iconCircle}>
                        <Feather name="download" size={20} color={colors.primary} />
                    </View>
                </View>

                <Text style={styles.pendingNumber}>{pendingCount}</Text>

            </HomeCard>

            {/* CARD - AGENDA CONFIRMADA ou AGENDA LIVRE */}
            {hasAppointmentsToday ? (
                <HomeCard
                    backgroundColor="#E7EDED"
                    style={styles.cardSpacing}
                    onPress={() => console.log("Ver agenda completa")}
                >
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Agenda Confirmada</Text>
                        <View style={styles.iconCircle}>
                            <Feather name="calendar" size={20} color={colors.primary} />
                        </View>
                    </View>

                    <View style={styles.appointmentsWrapper}>
                        {APPOINTMENTS.map((item, index) => (
                            <View key={item.id}>
                                <View style={styles.appointmentRow}>
                                    <Text style={styles.appointmentName}>{item.name}</Text>
                                    <Text style={styles.appointmentTime}>{item.time}</Text>
                                </View>
                                {index < APPOINTMENTS.length - 1 && (
                                    <View style={styles.divider} />
                                )}
                            </View>
                        ))}
                    </View>
                </HomeCard>
            ) : (
                <HomeCard backgroundColor="#EAE7DD" style={[styles.cardSpacing, styles.cardFree]}>
                    <View style={styles.freeContent}>
                        <View style={styles.freeIconCircle}>
                            <Text style={styles.freeIconText}>☺</Text>
                        </View>
                        <View style={styles.freeTextWrapper}>
                            <Text style={styles.freeTitle}>Sua agenda está livre hoje!</Text>
                            <Text style={styles.freeSubtitle}>
                                Nenhuma consulta confirmada para o dia.
                            </Text>
                        </View>
                    </View>
                </HomeCard>
            )}
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
        fontSize: fontSizes.lg,
        color: colors.text,
        fontFamily: fonts.bold,
    },
    headerIconButton: {
        padding: spacing.xs,
    },
    cardFree: {
        marginBottom: spacing.md,
    },
    cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: fontSizes.lg,
        color: colors.text,
        fontFamily: fonts.bold,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#D7DFD9",
        alignItems: "center",
        justifyContent: "center",
    },
    pendingNumber: {
        fontSize: 40,
        color: colors.primary,
        fontFamily: fonts.bold,
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
    },
    inlineRightButton: {
        alignSelf: "flex-end",
        marginTop: spacing.xs,
    },
    inlineRightText: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontFamily: fonts.regular,
    },
    appointmentsWrapper: {
        marginTop: spacing.xs,
    },
    cardSpacing: {
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
        backgroundColor: "#D0D7D7",
    },
    freeContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    freeIconCircle: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "#D7DFD9",
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
    },
    freeIconText: {
        fontSize: 26,
        color: colors.primary,
    },
    freeTextWrapper: {
        flex: 1,
    },
    freeTitle: {
        fontSize: fontSizes.md,
        color: colors.text,
        fontFamily: fonts.bold,
        marginBottom: spacing.xs,
    },
    freeSubtitle: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontFamily: fonts.regular,
    },
});
