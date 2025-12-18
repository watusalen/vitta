import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing, fontSizes, borderRadius } from "@/view/themes/theme";
import TextInputField from "@/view/components/TextInputField";
import useLoginViewModel from "@/viewmodel/auth/useLoginViewModel";
import { authUseCases } from "@/di/container";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { loading, error, login, user } = useLoginViewModel(authUseCases);

    useEffect(() => {
        if (user) {
            if (user.role === 'nutritionist') {
                router.replace('/nutritionist-home');
            } else {
                router.replace('/patient-home');
            }
        }
    }, [user]);

    async function handleLogin() {
        await login(email, password);
    }

    function handleForgotPassword() {
        console.log("Forgot password");
    }

    function handleSignUp() {
        router.push('/register');
    }

    return (
        <View style={styles.container}>
            <View>
                <View style={styles.logoWrapper}>
                    <Image
                        source={require("../assets/images/image.png")}
                        style={styles.logo}
                    />
                </View>

                <Text style={styles.title}>Bem-vindo(a) de volta!</Text>
                <Text style={styles.subtitle}>Faça login para continuar</Text>

                <TextInputField
                    label="E-mail"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChangeText={setEmail}
                    icon="mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInputField
                    label="Senha"
                    placeholder="Digite sua senha"
                    value={password}
                    onChangeText={setPassword}
                    icon="lock"
                    secureTextEntry
                />

                <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
                    <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
                </TouchableOpacity>

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

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
                    <Text style={styles.footerHighlight} onPress={handleSignUp}> Cadastre-se</Text>
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
        resizeMode: 'contain',
    },
    title: {
        fontSize: fontSizes.xl + 4,
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
        marginBottom: spacing.xl,
    },
    forgotText: {
        fontSize: fontSizes.sm + 2,
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
        fontSize: fontSizes.lg - 2,
        color: colors.background,
        fontFamily: fonts.bold,
    },
    footer: {
        alignItems: "center",
    },
    footerText: {
        fontSize: fontSizes.sm + 2,
        color: colors.textSecondary,
        fontFamily: fonts.regular,
    },
    footerHighlight: {
        color: colors.primary,
        fontFamily: fonts.bold,
    },
    errorContainer: {
        backgroundColor: colors.error + '15',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    errorText: {
        color: colors.error,
        fontSize: fontSizes.sm + 2,
        fontFamily: fonts.regular,
        textAlign: 'center',
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
});
