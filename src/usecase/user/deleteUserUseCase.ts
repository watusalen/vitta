import { IUserRepository } from "@/model/repositories/iUserRepository";
import { assertNonEmpty } from "@/usecase/utils/validationUtils";
import { IDeleteUserUseCase } from "@/usecase/user/iDeleteUserUseCase";

export default class DeleteUserUseCase implements IDeleteUserUseCase {
    constructor(private userRepository: IUserRepository) {}

    async deleteById(userId: string): Promise<void> {
        assertNonEmpty(userId, "Usuário inválido.");
        await this.userRepository.deleteUser(userId);
    }
}