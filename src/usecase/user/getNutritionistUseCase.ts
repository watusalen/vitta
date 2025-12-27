import { IUserRepository } from "@/model/repositories/iUserRepository";
import RepositoryError from "@/model/errors/repositoryError";
import ValidationError from "@/model/errors/validationError";
import { IGetNutritionistUseCase } from "@/usecase/user/iGetNutritionistUseCase";
import User from "@/model/entities/user";

export default class GetNutritionistUseCase implements IGetNutritionistUseCase {
    constructor(private userRepository: IUserRepository) { }

    async getNutritionist(): Promise<User | null> {
        try {
            const nutritionists = await this.userRepository.getByRole('nutritionist');

            if (nutritionists.length === 0) {
                throw new ValidationError('Nenhuma nutricionista cadastrada.');
            }

            if (nutritionists.length > 1) {
                throw new ValidationError('Existem múltiplas nutricionistas cadastradas.');
            }

            return nutritionists[0];
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError('Erro ao buscar nutricionista.');
        }
    }
}
