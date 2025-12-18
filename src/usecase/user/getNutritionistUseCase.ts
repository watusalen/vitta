import User from "@/model/entities/user";
import { IUserRepository } from "@/model/repositories/iUserRepository";
import RepositoryError from "@/model/errors/repositoryError";

export interface IGetNutritionistUseCase {
    execute(): Promise<User | null>;
}

export default class GetNutritionistUseCase implements IGetNutritionistUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(): Promise<User | null> {
        try {
            const nutritionists = await this.userRepository.getByRole('nutritionist');

            if (nutritionists.length === 0) {
                return null;
            }

            return nutritionists[0];
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError('Erro ao buscar nutricionista.');
        }
    }
}
