import { useState, useEffect, useCallback } from "react";
import User from "@/model/entities/user";
import { IAuthUseCases } from "@/usecase/auth/iAuthUseCases";
import { resolveLoginError, resolveResetPasswordError, validateLoginInputs } from "@/viewmodel/auth/helpers/loginViewModelHelpers";

export type LoginState = {
    user: User | null;
    error: string | null;
    emailError: string | null;
    passwordError: string | null;
    resetLoading: boolean;
    resetSuccess: string | null;
    loading: boolean;
    redirectRoute: string | null;
    navigationRoute: string | null;
    navigationMethod: "replace" | "push";
};

export type LoginActions = {
    login: (email: string, password: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    clearError: () => void;
    clearResetSuccess: () => void;
    goToForgotPassword: () => void;
    goToRegister: () => void;
    goToLogin: () => void;
    clearNavigation: () => void;
};

export default function useLoginViewModel(authUseCases: IAuthUseCases): LoginState & LoginActions {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState<string | null>(null);
    const [navigationRoute, setNavigationRoute] = useState<string | null>(null);
    const [navigationMethod, setNavigationMethod] = useState<"replace" | "push">("replace");

    useEffect(() => {
        const unsubscribe = authUseCases.onAuthStateChanged((authUser) => {
            setUser(authUser);
        });

        return () => unsubscribe();
    }, [authUseCases]);

    const login = useCallback(async (email: string, password: string): Promise<void> => {
        const { trimmedEmail, trimmedPassword, emailError, passwordError, isValid } = validateLoginInputs(email, password);
        if (!isValid) {
            setEmailError(emailError);
            setPasswordError(passwordError);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        setEmailError(null);
        setPasswordError(null);

        try {
            const loggedUser = await authUseCases.login(trimmedEmail, trimmedPassword);
            setUser(loggedUser);
        } catch (error: unknown) {
            const resolved = resolveLoginError(error);
            setEmailError(resolved.emailError);
            setPasswordError(resolved.passwordError);
            setError(resolved.error);
        } finally {
            setLoading(false);
        }
    }, [authUseCases]);

    const clearError = useCallback(() => {
        setError(null);
        setEmailError(null);
        setPasswordError(null);
    }, []);

    const resetPassword = useCallback(async (email: string): Promise<void> => {
        setResetLoading(true);
        setResetSuccess(null);
        setEmailError(null);

        try {
            await authUseCases.resetPassword(email);
            setResetSuccess("Enviamos um link para redefinir sua senha.");
        } catch (error: unknown) {
            setEmailError(resolveResetPasswordError(error));
        } finally {
            setResetLoading(false);
        }
    }, [authUseCases]);

    const clearResetSuccess = useCallback(() => {
        setResetSuccess(null);
    }, []);

    const goToForgotPassword = useCallback(() => {
        setNavigationMethod("push");
        setNavigationRoute("/forgot-password");
    }, []);

    const goToRegister = useCallback(() => {
        setNavigationMethod("push");
        setNavigationRoute("/register");
    }, []);

    const goToLogin = useCallback(() => {
        setNavigationMethod("replace");
        setNavigationRoute("/login");
    }, []);

    const clearNavigation = useCallback(() => {
        setNavigationRoute(null);
    }, []);

    const redirectRoute = user ? "/" : null;

    return {
        user,
        error,
        emailError,
        passwordError,
        resetLoading,
        resetSuccess,
        loading,
        redirectRoute,
        navigationRoute,
        navigationMethod,
        login,
        resetPassword,
        clearError,
        clearResetSuccess,
        goToForgotPassword,
        goToRegister,
        goToLogin,
        clearNavigation
    };
}
