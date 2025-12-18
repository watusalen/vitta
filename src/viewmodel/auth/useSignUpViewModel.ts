import { useState, useCallback } from "react";
import User from "@/model/entities/user";
import AuthError from "@/model/errors/authError";
import ValidationError from "@/model/errors/validationError";
import RepositoryError from "@/model/errors/repositoryError";
import { IAuthUseCases } from "@/usecase/auth/iAuthUseCases";

export type SignUpState = {
    user: User | null;
    error: string | null;
    loading: boolean;
    isRegistered: boolean;
};

export type SignUpActions = {
    signUp: (name: string, email: string, password: string) => Promise<void>;
    clearError: () => void;
};

export default function useSignUpViewModel(authUseCases: IAuthUseCases): SignUpState & SignUpActions {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signUp = useCallback(async (name: string, email: string, password: string): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const newUser = await authUseCases.signUp(name, email, password);
            setUser(newUser);
        } catch (err: unknown) {
            if (err instanceof ValidationError) {
                setError(err.message);
            } else if (err instanceof AuthError) {
                setError(err.message);
            } else if (err instanceof RepositoryError) {
                setError(err.message);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Erro desconhecido ao criar conta');
            }
        } finally {
            setLoading(false);
        }
    }, [authUseCases]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        user,
        error,
        loading,
        isRegistered: user !== null,
        signUp,
        clearError
    };
}
