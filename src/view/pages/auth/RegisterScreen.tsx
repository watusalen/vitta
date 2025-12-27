import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoid}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxl }
                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.logoWrapper}>
                            <Image
                                source={require("../../assets/images/image.png")}
                                style={styles.logo}
                            />
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
                                <Text style={styles.footerHighlight} onPress={goToLogin}> Entrar</Text>
                            </Text>
                        </View>
                    </ScrollView>
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
        marginBottom: 20,
    },
    signUpButton: {
        backgroundColor: colors.primary,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacing.md,
        marginBottom: spacing.xl,
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
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
