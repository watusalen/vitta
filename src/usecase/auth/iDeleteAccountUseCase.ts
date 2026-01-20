export interface IDeleteAccountUseCase {
    deleteAccount(userId: string): Promise<void>;
}
