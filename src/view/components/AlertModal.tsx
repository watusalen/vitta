import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, spacing, fontSizes, borderRadius } from "@/view/themes/theme";

type Variant = "info" | "success" | "error" | "warning";

type Props = {
  visible: boolean;
  variant?: Variant;
  title: string;
  message?: string;
  confirmText?: string;
  onConfirm: () => void;
};

const variantConfig: Record<Variant, { icon: string; accent: string }> = {
  info: { icon: "info", accent: colors.primary },
  success: { icon: "check", accent: colors.primary },
  error: { icon: "x", accent: colors.error },
  warning: { icon: "alert-triangle", accent: colors.warning ?? colors.error },
};

export default function AlertModal({
  visible,
  variant = "info",
  title,
  message,
  confirmText = "OK",
  onConfirm,
}: Props) {
  const { icon, accent } = variantConfig[variant];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onConfirm}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: withAlpha(accent, 0.12) }]}>
            <Feather name={icon as any} size={22} color={accent} />
          </View>

          <Text style={styles.title}>{title}</Text>

          {!!message && <Text style={styles.subtitle}>{message}</Text>}

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: accent }]}
            onPress={onConfirm}
            activeOpacity={0.9}
          >
            <Text style={styles.btnText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function withAlpha(hexColor: string, alpha: number) {
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
    fontSize: fontSizes.lgMd,
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

  btn: {
    width: "100%",
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },

  btnText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.bold,
    color: colors.background,
  },
});
