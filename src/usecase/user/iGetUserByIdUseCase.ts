import User from "@/model/entities/user";

export interface IGetUserByIdUseCase {
    getById(userId: string): Promise<User | null>;
}
