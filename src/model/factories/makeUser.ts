import User from "../entities/user"
import { generateId } from "../utils/idUtils"

interface CreateUserInput {
    id?: string;
    name: string;
    email: string;
    role: 'patient' | 'nutritionist';
}

export function makeUser(user: CreateUserInput): User {
    return {
        id: user.id ?? generateId('user'),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: new Date(),
    };
}
