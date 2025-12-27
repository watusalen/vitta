import User from "@/model/entities/user";

export interface IGetNutritionistUseCase {
    getNutritionist(): Promise<User | null>;
}
