export interface IDeleteUserUseCase {
    deleteById(userId: string): Promise<void>;
}