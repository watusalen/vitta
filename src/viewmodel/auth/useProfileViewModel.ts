import { useCallback, useEffect, useMemo, useState } from "react";
import AuthError from "@/model/errors/authError";
import { IAuthUseCases } from "@/usecase/auth/iAuthUseCases";
import { IDeleteAccountUseCase } from "@/usecase/auth/iDeleteAccountUseCase";
import { IPushTokenUseCase } from "@/usecase/notifications/iPushTokenUseCase";

type ProfileRoleLabel = "Nutricionista" | "Paciente";

export default function useProfileViewModel(
    authUseCases: IAuthUseCases,
    deleteAccountUseCase: IDeleteAccountUseCase,
    pushTokenUseCase: IPushTokenUseCase
) {
    const [user, setUser] = useState<{ id: string; name: string; email: string; role: ProfileRoleLabel } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = authUseCases.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser({
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                    role: currentUser.role === "nutritionist" ? "Nutricionista" : "Paciente",
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [authUseCases]);

    const displayName = useMemo(() => user?.name || user?.email || "Usuário", [user]);

    const deleteAccount = useCallback(async () => {
        if (!user?.id) {
            setError("Usuário não autenticado.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            try {
                await pushTokenUseCase.unregister(user.id);
            } catch {
                setError("Não foi possível remover o token de notificações.");
            }
            await deleteAccountUseCase.deleteAccount(user.id);
            setUser(null);
        } catch (err: unknown) {
            if (err instanceof AuthError) {
                setError(err.message);
            } else {
                setError("Erro ao excluir conta.");
            }
        } finally {
            setLoading(false);
        }
    }, [deleteAccountUseCase, pushTokenUseCase, user]);

    const clearError = useCallback(() => setError(null), []);

    return {
        user,
        loading,
        error,
        displayName,
        deleteAccount,
        clearError,
    };
}
