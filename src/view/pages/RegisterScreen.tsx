import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, spacing, fontSizes, borderRadius } from "@/view/themes/theme";
import { authUseCases } from "@/di/container";
import useSignUpViewModel from "@/viewmodel/auth/useSignUpViewModel";
import TextInputField from "@/view/components/TextInputField";
import ErrorMessage from "@/view/components/ErrorMessage";

export default function RegisterScreen() {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const { user, error, loading, signUp, clearError } = useSignUpViewModel(authUseCases);

    useEffect(() => {
        if (user) {
            router.replace("/patient-home");
        }
    }, [user]);

    useEffect(() => {
        if (error || localError) {
            const timer = setTimeout(() => {
                clearError();
                setLocalError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, localError, clearError]);

    function handleSignUp() {
        if (password !== confirmPassword) {
            setLocalError("As senhas não coincidem");
            return;
        }
        signUp(name, email, password);
    }

    function handleLogin() {
        router.back();
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + spacing.lg }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.logoWrapper}>
                    <Image
                        source={require("../assets/images/image.png")}
                        style={styles.logo}
                    />
                </View>

                <Text style={styles.title}>Crie sua conta</Text>
                <Text style={styles.subtitle}>Preencha os dados para se cadastrar</Text>

                <TextInputField
                    label="Nome completo"
                    placeholder="Digite seu nome"
                    value={name}
                    onChangeText={setName}
                    icon="user"
                    autoCapitalize="words"
                />

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

                <TextInputField
                    label="Confirmar senha"
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    icon="lock"
                    secureTextEntry
                />

                {(localError || error) && (
                    <ErrorMessage message={(localError || error) as string} />
                )}

                <TouchableOpacity
                    style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.background} />
                    ) : (
                        <Text style={styles.signUpButtonText}>Criar conta</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Já tem uma conta?
                        <Text style={styles.footerHighlight} onPress={handleLogin}> Entrar</Text>
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
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
        marginBottom: 20,
    },
    signUpButton: {
        backgroundColor: colors.primary,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacing.md,
    },
    signUpButtonText: {
        fontSize: fontSizes.lg - 2,
        color: colors.background,
        fontFamily: fonts.bold,
    },
    signUpButtonDisabled: {
        opacity: 0.7,
    },
    footer: {
        alignItems: "center",
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
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
});
