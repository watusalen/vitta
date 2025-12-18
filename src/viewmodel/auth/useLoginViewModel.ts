import { useState, useEffect, useCallback } from "react";
import User from "@/model/entities/user";
import AuthError from "@/model/errors/authError";
import ValidationError from "@/model/errors/validationError";
import RepositoryError from "@/model/errors/repositoryError";
import { IAuthUseCases } from "@/usecase/auth/iAuthUseCases";

export type LoginState = {
    user: User | null;
    error: string | null;
    loading: boolean;
    isAuthenticated: boolean;
};

export type LoginActions = {
    login: (email: string, password: string) => Promise<void>;
    clearError: () => void;
};

export default function useLoginViewModel(authUseCases: IAuthUseCases): LoginState & LoginActions {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = authUseCases.onAuthStateChanged((authUser) => {
            setUser(authUser);
        });

        return () => unsubscribe();
    }, [authUseCases]);

    const login = useCallback(async (email: string, password: string): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const loggedUser = await authUseCases.login(email, password);
            setUser(loggedUser);
        } catch (error: unknown) {
            if (error instanceof ValidationError) {
                setError(error.message);
            } else if (error instanceof AuthError) {
                setError(error.message);
            } else if (error instanceof RepositoryError) {
                setError(error.message);
            } else {
                setError('Erro desconhecido ao fazer login');
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
        isAuthenticated: user !== null,
        login,
        clearError
    };
}
