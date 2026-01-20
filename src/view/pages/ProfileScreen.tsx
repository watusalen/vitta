import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fontSizes, fonts, spacing, borderRadius } from "@/view/themes/theme";
import { useProfileViewModel } from "@/di/container";
import AlertModal from "@/view/components/AlertModal";
import ConfirmActionModal from "@/view/components/ConfirmActionModal";
import ScreenHeader from "@/view/components/ScreenHeader";

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
}

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { user, loading, error, clearError, deleteAccount, displayName } = useProfileViewModel();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);

    const initials = getInitials(displayName);
    const roleLabel = user?.role ?? "Paciente";

    useEffect(() => {
        if (!error) return;
        setErrorOpen(true);
    }, [error]);

    async function handleDelete() {
        setConfirmOpen(false);
        await deleteAccount();
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <ScreenHeader title="Perfil" />
            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loadingWrapper}>
                        <Text style={styles.loadingText} maxFontSizeMultiplier={1.2}>Carregando...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.header}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText} maxFontSizeMultiplier={1.2}>{initials}</Text>
                            </View>
                            <Text style={styles.name} maxFontSizeMultiplier={1.2}>{displayName}</Text>
                            <Text style={styles.role} maxFontSizeMultiplier={1.2}>{roleLabel}</Text>
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => setConfirmOpen(true)}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.deleteButtonText} maxFontSizeMultiplier={1.2}>Excluir conta</Text>
                            </TouchableOpacity>
                            <Text style={styles.hint}>
                                Esta ação é permanente e remove seus dados do sistema.
                            </Text>
                        </View>
                    </>
                )}
            </View>

            <ConfirmActionModal
                visible={confirmOpen}
                variant="reject"
                title="Excluir conta"
                subtitle="Tem certeza? Esta ação é irreversível."
                confirmText="Excluir"
                onConfirm={handleDelete}
                onClose={() => setConfirmOpen(false)}
            />

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
        backgroundColor: colors.surface,
    },
    content: {
        flex: 1,
        paddingTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        justifyContent: "space-between",
    },
    header: {
        alignItems: "center",
        marginTop: spacing.lg,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    avatarText: {
        fontSize: fontSizes.xl2,
        fontFamily: fonts.bold,
        color: colors.primary,
    },
    name: {
        fontSize: fontSizes.xl,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: spacing.xs,
        textAlign: "center",
    },
    role: {
        fontSize: fontSizes.md,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
    },
    actions: {
        paddingBottom: spacing.xl,
    },
    loadingWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        fontSize: fontSizes.mdLg,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
    },
    deleteButton: {
        height: 56,
        borderRadius: borderRadius.full,
        backgroundColor: colors.error,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    deleteButtonText: {
        fontSize: fontSizes.mdLg,
        fontFamily: fonts.bold,
        color: colors.white,
    },
    hint: {
        fontSize: fontSizes.smMd,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        textAlign: "center",
    },
});
