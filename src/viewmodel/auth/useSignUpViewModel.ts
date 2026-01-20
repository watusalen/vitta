import { useState, useCallback } from "react";
import User from "@/model/entities/user";
import { IAuthUseCases } from "@/usecase/auth/iAuthUseCases";
import { resolveSignUpError, validateSignUpInputs } from "@/viewmodel/auth/helpers/signUpViewModelHelpers";

export type SignUpState = {
    user: User | null;
    error: string | null;
    nameError: string | null;
    emailError: string | null;
    passwordError: string | null;
    confirmPasswordError: string | null;
    loading: boolean;
    redirectRoute: string | null;
    navigationRoute: string | null;
    navigationMethod: "replace" | "push";
};

export type SignUpActions = {
    signUp: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
    clearError: () => void;
    goToLogin: () => void;
    clearNavigation: () => void;
};

export default function useSignUpViewModel(authUseCases: IAuthUseCases): SignUpState & SignUpActions {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
    const [navigationRoute, setNavigationRoute] = useState<string | null>(null);
    const [navigationMethod, setNavigationMethod] = useState<"replace" | "push">("replace");

    const signUp = useCallback(async (
        name: string,
        email: string,
        password: string,
        confirmPassword: string
    ): Promise<void> => {
        setNameError(null);
        setEmailError(null);
        setPasswordError(null);
        setConfirmPasswordError(null);
        setError(null);

        const { trimmedName, trimmedEmail, trimmedPassword, errors } = validateSignUpInputs(
            name,
            email,
            password,
            confirmPassword
        );

        if (errors.nameError || errors.emailError || errors.passwordError || errors.confirmPasswordError) {
            setNameError(errors.nameError);
            setEmailError(errors.emailError);
            setPasswordError(errors.passwordError);
            setConfirmPasswordError(errors.confirmPasswordError);
            return;
        }

        setLoading(true);

        try {
            const newUser = await authUseCases.signUp(trimmedName, trimmedEmail, trimmedPassword);
            setUser(newUser);
        } catch (err: unknown) {
            const resolved = resolveSignUpError(err);
            setNameError(resolved.nameError);
            setEmailError(resolved.emailError);
            setPasswordError(resolved.passwordError);
            setConfirmPasswordError(resolved.confirmPasswordError);
            setError(resolved.formError);
        } finally {
            setLoading(false);
        }
    }, [authUseCases]);

    const clearError = useCallback(() => {
        setError(null);
        setNameError(null);
        setEmailError(null);
        setPasswordError(null);
        setConfirmPasswordError(null);
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
        clearNavigation
    };
}
