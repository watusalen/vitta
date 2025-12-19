import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, spacing, fontSizes } from "@/view/themes/theme";

type Props = {
  error: Error;
};

export default function BootstrapErrorScreen({ error }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="alert-circle" size={64} color={colors.error} />
        </View>

        <Text style={styles.title}>Erro na Inicialização</Text>

        <Text style={styles.message}>
          Desculpe, houve um problema ao iniciar o aplicativo. Verifique se todas as configurações estão corretas.
        </Text>

        <View style={styles.errorBox}>
          <Text style={styles.errorLabel}>Detalhes do erro:</Text>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>

        <Text style={styles.hint}>
          Se o problema persistir, reinstale o aplicativo ou entre em contato com o suporte.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },

  content: {
    alignItems: "center",
    maxWidth: 420,
  },

  iconContainer: {
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: fontSizes.xl + 4,
    fontFamily: fonts.bold,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: "center",
  },

  message: {
    fontSize: fontSizes.md,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 24,
  },

  errorBox: {
    width: "100%",
    backgroundColor: "rgba(217, 74, 74, 0.08)",
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },

  errorLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bold,
    color: colors.error,
    marginBottom: spacing.xs,
  },

  errorText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    color: colors.text,
    lineHeight: 20,
  },

  hint: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
