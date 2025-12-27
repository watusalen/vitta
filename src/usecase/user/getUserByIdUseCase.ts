import User from "@/model/entities/user";
import { IUserRepository } from "@/model/repositories/iUserRepository";
import { assertNonEmpty } from "@/usecase/utils/validationUtils";
import { IGetUserByIdUseCase } from "@/usecase/user/iGetUserByIdUseCase";

export default class GetUserByIdUseCase implements IGetUserByIdUseCase {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async getById(userId: string): Promise<User | null> {
        assertNonEmpty(userId, "Usuário inválido.");
        return this.userRepository.getUserByID(userId);
    }
}
