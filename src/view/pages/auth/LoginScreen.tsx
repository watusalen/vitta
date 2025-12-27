import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from "react-native";
import { colors, fonts, spacing, fontSizes } from "@/view/themes/theme";
import TextInputField from "@/view/pages/auth/components/TextInputField";
import { useAuthLoginViewModel } from "@/di/container";
import useRedirectEffect from "@/view/hooks/useRedirectEffect";

export default function LoginScreen() {
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

    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoid}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>
                    <View>
                        <View style={styles.logoWrapper}>
                            <Image
                                source={require("../../assets/images/image.png")}
                                style={styles.logo}
                            />
                        </View>

                        <Text style={styles.title}>Bem-vindo(a) de volta!</Text>
                        <Text style={styles.subtitle}>Faça login para continuar</Text>

                        <TextInputField
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
                            <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.background} />
                            ) : (
                                <Text style={styles.loginButtonText}>Entrar</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Não tem uma conta?
                            <Text style={styles.footerHighlight} onPress={goToRegister}> Cadastre-se</Text>
                        </Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoid: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
        paddingTop: 72,
        paddingBottom: spacing.xl,
        justifyContent: "space-between",
    },
    logoWrapper: {
        alignSelf: "center",
        width: 100,
        height: 100,
        borderRadius: 60,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.xl,
    },
    logo: {
        width: 70,
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
        marginBottom: 40,
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
        height: 64,
        borderRadius: 32,
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
        marginTop: spacing.lg,
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
