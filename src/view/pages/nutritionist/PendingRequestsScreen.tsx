import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, spacing, fontSizes } from "@/view/themes/theme";
import { appointmentRepository, acceptAppointmentUseCase, rejectAppointmentUseCase, userRepository } from "@/di/container";
import useHomeViewModel from "@/viewmodel/auth/useHomeViewModel";
import usePendingRequestsViewModel, { PendingAppointmentItem } from "@/viewmodel/nutritionist/usePendingRequestsViewModel";
import { authUseCases } from "@/di/container";
import ScreenHeader from "@/view/components/ScreenHeader";
import EmptyStateCard from "@/view/components/EmptyStateCard";
import ConfirmActionModal from "@/view/components/ConfirmActionModal";
import ErrorScreen from "@/view/components/ErrorScreen";

export default function PendingRequestsScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useHomeViewModel(authUseCases);
    const nutritionistId = user?.id || "";

    const [modalOpen, setModalOpen] = useState(false);
    const [modalVariant, setModalVariant] = useState<"accept" | "reject">("accept");
    const [selectedItem, setSelectedItem] = useState<PendingAppointmentItem | null>(null);
    const [showError, setShowError] = useState(false);

    const {
        pendingAppointments,
        loading,
        processing,
        error,
        successMessage,
        acceptAppointment,
        rejectAppointment,
        clearError,
        clearSuccess,
    } = usePendingRequestsViewModel(
        appointmentRepository,
        acceptAppointmentUseCase,
        rejectAppointmentUseCase,
        userRepository,
        nutritionistId
    );

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => clearSuccess(), 2000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, clearSuccess]);

    useEffect(() => {
        if (error && !modalOpen) {
            setShowError(true);
        }
    }, [error, modalOpen]);

    function handleAccept(item: PendingAppointmentItem) {
        setSelectedItem(item);
        setModalVariant("accept");
        setModalOpen(true);
    }

    function handleReject(item: PendingAppointmentItem) {
        setSelectedItem(item);
        setModalVariant("reject");
        setModalOpen(true);
    }

    function getInitials(name: string) {
        const parts = name.trim().split(/\s+/);
        const first = parts[0]?.[0] ?? "";
        const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
        return (first + last).toUpperCase();
    }

    function renderAppointmentRow({ item }: { item: PendingAppointmentItem }) {
        const initials = getInitials(item.patientName);

        return (
            <View style={styles.row}>
                {/* Avatar */}
                <View style={styles.avatar}>
                    {initials.length >= 2 ? (
                        <Text style={styles.avatarText}>{initials}</Text>
                    ) : (
                        <Feather name="user" size={22} color={colors.textSecondary} />
                    )}
                </View>

                {/* Texto */}
                <View style={styles.rowInfo}>
                    <Text style={styles.patientName}>{item.patientName}</Text>
                    <Text style={styles.subtitle}>
                        {item.dateFormatted}, {item.timeStart}
                    </Text>
                </View>

                {/* Ações */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.iconBtn, styles.rejectBtn]}
                        onPress={() => handleReject(item)}
                        disabled={processing}
                        activeOpacity={0.85}
                    >
                        <Feather name="x" size={20} color={colors.error} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.iconBtn, styles.acceptBtn]}
                        onPress={() => handleAccept(item)}
                        disabled={processing}
                        activeOpacity={0.85}
                    >
                        <Feather name="check" size={20} color={colors.success} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScreenHeader title="Solicitações Pendentes" />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    if (showError && error) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScreenHeader title="Solicitações Pendentes" />
                <ErrorScreen
                    message={error}
                    onRetry={() => {
                        setShowError(false);
                        clearError();
                    }}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScreenHeader title="Solicitações Pendentes" />

            {pendingAppointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <EmptyStateCard
                        icon="inbox"
                        title="Nenhuma solicitação pendente"
                        subtitle="Novas solicitações aparecerão aqui"
                    />
                </View>
            ) : (
                <FlatList
                    data={pendingAppointments}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAppointmentRow}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <ConfirmActionModal
                visible={modalOpen}
                variant={modalVariant}
                title={modalVariant === "accept" ? "Aceitar consulta?" : "Recusar consulta?"}
                subtitle={
                    selectedItem
                        ? `${selectedItem.patientName}\n${selectedItem.dateFormatted}, ${selectedItem.timeStart}`
                        : ""
                }
                loading={processing}
                onClose={() => setModalOpen(false)}
                onConfirm={() => {
                    if (!selectedItem) return;
                    if (modalVariant === "accept") acceptAppointment(selectedItem.id);
                    else rejectAppointment(selectedItem.id);
                    setModalOpen(false);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface, // fica mais "off-white" igual mock
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg, // espaçamento entre linhas
  },

  // ====== ROW (mock) ======
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.inputBackground, // cinza/bege do mock
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  avatarText: {
    fontSize: fontSizes.lg - 1,
    fontFamily: fonts.bold,
    color: colors.primary,
  },

  rowInfo: {
    flex: 1,
    justifyContent: "center",
  },

  patientName: {
    fontSize: fontSizes.md + 2,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 2,
  },

  subtitle: {
    fontSize: fontSizes.md - 2,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginLeft: spacing.md,
  },

  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  rejectBtn: {
    backgroundColor: "rgba(217, 74, 74, 0.12)", // vermelho suave
  },

  acceptBtn: {
    backgroundColor: "rgba(73, 132, 99, 0.12)", // verde suave
  },
});
