import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, spacing, fontSizes, borderRadius } from "@/view/themes/theme";

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Feather.glyphMap;
};

export default function EmptyStateCard({
  title,
  subtitle = "",
  icon = "smile",
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Feather name={icon} size={28} color={colors.primary} />
      </View>

      <Text style={styles.title}>{title}</Text>

      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.xl + 6,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },

  title: {
    fontSize: fontSizes.lg,
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
  },
});
