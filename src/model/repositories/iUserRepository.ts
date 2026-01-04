import User from "../entities/user";

export interface IUserRepository {
    createUser(user: User): Promise<void>;
    getUserByID(uID: string): Promise<User | null>;
    getByRole(role: 'patient' | 'nutritionist'): Promise<User[]>;
    addPushToken(userId: string, token: string): Promise<void>;
    removePushToken(userId: string, token: string): Promise<void>;
    getPushTokens(userId: string): Promise<string[]>;
}
