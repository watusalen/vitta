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
import TextInputField from "@/view/pages/auth/components/TextInputField";
import { useAuthLoginViewModel } from "@/di/container";
import useRedirectEffect from "@/view/hooks/useRedirectEffect";

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {
        loading,
        error,
        emailError,
        passwordError,
        redirectRoute,
        navigationRoute,
        navigationMethod,
        login,
        clearError,
        goToForgotPassword,
        goToRegister,
        clearNavigation,
    } = useAuthLoginViewModel();

    useRedirectEffect(redirectRoute);
    useRedirectEffect(navigationRoute, { method: navigationMethod, onComplete: clearNavigation });

    async function handleLogin() {
        await login(email, password);
    }

    function handleEmailChange(value: string) {
        setEmail(value);
        clearError();
    }

    function handlePasswordChange(value: string) {
        setPassword(value);
        clearError();
    }

    const bottomSafe = Math.max(insets.bottom, 48);

    return (
        <KeyboardAwareScrollView
            testID="login-screen"
            style={styles.container}
            contentContainerStyle={[
                styles.scrollContent,
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
                            <Image
                                source={require("../../assets/images/image.png")}
                                style={styles.logo}
                            />
                        </View>

                        <Text style={styles.title} maxFontSizeMultiplier={1.2}>Bem-vindo(a) de volta!</Text>
                        <Text style={styles.subtitle}>Faça login para continuar</Text>

                        <TextInputField
                            testID="email-input"
                            label="E-mail"
                            placeholder="Digite seu e-mail"
                            value={email}
                            onChangeText={handleEmailChange}
                            icon="mail"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            textContentType="emailAddress"
                            error={emailError ?? undefined}
                            hasError={!!emailError || !!error}
                        />

                        <TextInputField
                            testID="password-input"
                            label="Senha"
                            placeholder="Digite sua senha"
                            value={password}
                            onChangeText={handlePasswordChange}
                            icon="lock"
                            secureTextEntry
                            autoComplete="password"
                            textContentType="password"
                            hasError={!!passwordError || !!error}
                            error={passwordError ?? error ?? undefined}
                        />

                        <TouchableOpacity style={styles.forgotButton} onPress={goToForgotPassword}>
                            <Text style={styles.forgotText} maxFontSizeMultiplier={1.2}>Esqueceu sua senha?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            testID="login-button"
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.background} />
                            ) : (
                                <Text style={styles.loginButtonText} maxFontSizeMultiplier={1.2}>Entrar</Text>
                            )}
                        </TouchableOpacity>

            <View style={[styles.footer, { marginBottom: spacing.xl * 2 }]}>
                <Text style={styles.footerText}>
                    Não tem uma conta?
                    <Text style={styles.footerHighlight} onPress={goToRegister}> Cadastre-se</Text>
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
    scrollContent: {
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
    forgotButton: {
        alignSelf: "flex-end",
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
    },
    forgotText: {
        fontSize: fontSizes.smMd,
        color: colors.primary,
        fontFamily: fonts.regular,
    },
    loginButton: {
        backgroundColor: colors.primary,
        height: 56,
        paddingVertical: spacing.sm,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    loginButtonText: {
        fontSize: fontSizes.mdLg,
        color: colors.background,
        fontFamily: fonts.bold,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    footer: {
        alignItems: "center",
        marginTop: spacing.xl,
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