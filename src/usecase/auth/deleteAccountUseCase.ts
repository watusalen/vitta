import AuthError from "@/model/errors/authError";
import RepositoryError from "@/model/errors/repositoryError";
import { IAuthService } from "@/model/services/iAuthService";
import { IDeleteUserUseCase } from "@/usecase/user/iDeleteUserUseCase";
import { IDeleteAccountUseCase } from "@/usecase/auth/iDeleteAccountUseCase";

export default class DeleteAccountUseCase implements IDeleteAccountUseCase {
    constructor(
        private authService: IAuthService,
        private deleteUserUseCase: IDeleteUserUseCase
    ) {}

    async deleteAccount(userId: string): Promise<void> {
        try {
            await this.deleteUserUseCase.deleteById(userId);
            await this.authService.deleteAccount();
        } catch (error) {
            if (error instanceof AuthError) {
                throw error;
            }
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new Error("Erro interno ao excluir conta");
        }
    }
}
