import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { colors, fonts, spacing, fontSizes } from "@/view/themes/theme";
import { useAuthSignUpViewModel } from "@/di/container";
import useRedirectEffect from "@/view/hooks/useRedirectEffect";
import RegisterFormFields from "@/view/pages/auth/components/RegisterFormFields";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const {
    error,
    nameError,
    emailError,
    passwordError,
    confirmPasswordError,
    loading,
    redirectRoute,
    navigationRoute,
    navigationMethod,
    signUp,
    clearError,
    goToLogin,
    clearNavigation,
  } = useAuthSignUpViewModel();

  useRedirectEffect(redirectRoute);
  useRedirectEffect(navigationRoute, { method: navigationMethod, onComplete: clearNavigation });

  function handleSignUp() {
    signUp(name, email, password, confirmPassword);
  }

  function handleNameChange(value: string) {
    setName(value);
    clearError();
  }
  function handleEmailChange(value: string) {
    setEmail(value);
    clearError();
  }
  function handlePasswordChange(value: string) {
    setPassword(value);
    clearError();
  }
  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);
    clearError();
  }

  /**
   * ✅ Correção definitiva do footer e scroll do teclado:
   * - bottomSafe aumentado para 48px mínimo
   * - paddingBottom dinâmico: bottomSafe + spacing.xl + 16px
   * - extraScrollHeight/extraHeight aumentados para garantir visibilidade completa
   * - keyboardOpeningTime={0} para resposta imediata
   */
  const bottomSafe = Math.max(insets.bottom, 48);

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { 
          paddingTop: insets.top + spacing.lg, 
          paddingBottom: bottomSafe + spacing.lg + 24,
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      enableOnAndroid
      enableAutomaticScroll
      extraScrollHeight={Platform.OS === "android" ? 150 : 50}
      extraHeight={Platform.OS === "android" ? 100 : 50}
      enableResetScrollToCoords={false}
      keyboardOpeningTime={0}
    >
      <View style={styles.logoWrapper}>
        <Image source={require("../../assets/images/image.png")} style={styles.logo} />
      </View>

      <Text style={styles.title}>Crie sua conta</Text>
      <Text style={styles.subtitle}>Preencha os dados para se cadastrar</Text>

      <RegisterFormFields
        name={name}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        errors={{
          nameError,
          emailError,
          passwordError,
          confirmPasswordError,
          formError: error,
        }}
        onNameChange={handleNameChange}
        onEmailChange={handleEmailChange}
        onPasswordChange={handlePasswordChange}
        onConfirmPasswordChange={handleConfirmPasswordChange}
      />

      <TouchableOpacity
        style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.signUpButtonText}>Criar conta</Text>
        )}
      </TouchableOpacity>

      {/* ✅ footer sempre visível sem colar na navegação */}
      <View style={[styles.footer, { marginBottom: spacing.xl * 2 }]}>
        <Text style={styles.footerText}>
          Já tem uma conta?
          <Text style={styles.footerHighlight} onPress={goToLogin}>
            {" "}
            Entrar
          </Text>
        </Text>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  logoWrapper: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  logo: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  title: {
    fontSize: fontSizes.xl2,
    color: colors.text,
    textAlign: "center",
    fontFamily: fonts.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: "center",
    fontFamily: fonts.regular,
    marginBottom: spacing.md,
  },
  signUpButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    fontSize: fontSizes.mdLg,
    color: colors.background,
    fontFamily: fonts.bold,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  footerText: {
    fontSize: fontSizes.smMd,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },
  footerHighlight: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
});