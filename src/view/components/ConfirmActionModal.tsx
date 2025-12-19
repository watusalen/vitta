import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, spacing, fontSizes, borderRadius } from "@/view/themes/theme";

type Variant = "accept" | "reject";

type Props = {
  visible: boolean;
  variant: Variant;
  title: string;
  subtitle?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmActionModal({
  visible,
  variant,
  title,
  subtitle,
  confirmText,
  cancelText = "Cancelar",
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  const isReject = variant === "reject";

  const iconName = isReject ? "x" : "check";
  const accent = isReject ? colors.error : colors.success;

  const confirmLabel =
    confirmText ?? (isReject ? "Recusar" : "Aceitar");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: withAlpha(accent, 0.12) }]}>
            <Feather name={iconName} size={22} color={accent} />
          </View>

          <Text style={styles.title}>{title}</Text>

          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnGhostText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: accent },
                loading && styles.btnDisabled,
              ]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.9}
            >
              <Text style={styles.btnText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function withAlpha(hexColor: string, alpha: number) {
  // aceita "#RRGGBB"
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return "rgba(0,0,0,0.08)";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl + 6,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 6,
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },

  title: {
    fontSize: fontSizes.lg + 2,
    fontFamily: fonts.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xs,
  },

  subtitle: {
    fontSize: fontSizes.md,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },

  actions: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.sm,
  },

  btn: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },

  btnGhost: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },

  btnGhostText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.medium,
    color: colors.text,
  },

  btnText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.bold,
    color: colors.background,
  },

  btnDisabled: {
    opacity: 0.7,
  },
});
