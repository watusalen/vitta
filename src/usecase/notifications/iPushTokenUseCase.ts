export interface IPushTokenUseCase {
    register(userId: string): Promise<void>;
    unregister(userId: string): Promise<void>;
}
