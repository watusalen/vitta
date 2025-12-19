import FirebaseAuthService from '@/infra/firebase/service/firebaseAuthService';
import AuthError from '@/model/errors/authError';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';

jest.mock('firebase/auth');
jest.mock('@/infra/firebase/config', () => ({
    auth: {},
}));

const mockSignIn = signInWithEmailAndPassword as jest.Mock;
const mockCreateUser = createUserWithEmailAndPassword as jest.Mock;
const mockSignOut = signOut as jest.Mock;
const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;

describe('FirebaseAuthService', () => {
    let service: FirebaseAuthService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new FirebaseAuthService();
    });

    describe('login', () => {
        it('deve retornar usuário parcial quando login sucede', async () => {
            mockSignIn.mockResolvedValue({
                user: {
                    uid: 'user-123',
                    email: 'test@email.com',
                },
            });

            const result = await service.login('test@email.com', 'password123');

            expect(result).toEqual({
                id: 'user-123',
                email: 'test@email.com',
            });
            expect(mockSignIn).toHaveBeenCalledWith({}, 'test@email.com', 'password123');
        });

        it('deve retornar email vazio quando email é null', async () => {
            mockSignIn.mockResolvedValue({
                user: {
                    uid: 'user-123',
                    email: null,
                },
            });

            const result = await service.login('test@email.com', 'password123');

            expect(result.email).toBe('');
        });

        it('deve lançar AuthError quando login falha', async () => {
            mockSignIn.mockRejectedValue(new Error('Firebase error'));

            await expect(service.login('test@email.com', 'wrong')).rejects.toThrow(AuthError);
            await expect(service.login('test@email.com', 'wrong')).rejects.toThrow('Credenciais inválidas.');
        });
    });

    describe('signup', () => {
        it('deve retornar usuário parcial quando signup sucede', async () => {
            mockCreateUser.mockResolvedValue({
                user: {
                    uid: 'new-user-456',
                    email: 'new@email.com',
                },
            });

            const result = await service.signup('new@email.com', 'password123');

            expect(result).toEqual({
                id: 'new-user-456',
                email: 'new@email.com',
            });
            expect(mockCreateUser).toHaveBeenCalledWith({}, 'new@email.com', 'password123');
        });

        it('deve retornar email vazio quando email é null', async () => {
            mockCreateUser.mockResolvedValue({
                user: {
                    uid: 'new-user-456',
                    email: null,
                },
            });

            const result = await service.signup('new@email.com', 'password123');

            expect(result.email).toBe('');
        });

        it('deve lançar AuthError quando signup falha', async () => {
            mockCreateUser.mockRejectedValue(new Error('Email already exists'));

            await expect(service.signup('existing@email.com', 'password')).rejects.toThrow(AuthError);
            await expect(service.signup('existing@email.com', 'password')).rejects.toThrow(
                'Essa conta já existe ou alguma das credenciais está incorreta.'
            );
        });
    });

    describe('logout', () => {
        it('deve chamar signOut com sucesso', async () => {
            mockSignOut.mockResolvedValue(undefined);

            await expect(service.logout()).resolves.toBeUndefined();
            expect(mockSignOut).toHaveBeenCalledWith({});
        });

        it('deve lançar AuthError quando logout falha', async () => {
            mockSignOut.mockRejectedValue(new Error('Network error'));

            await expect(service.logout()).rejects.toThrow(AuthError);
            await expect(service.logout()).rejects.toThrow('Não foi possível fazer logout.');
        });
    });

    describe('onAuthStateChanged', () => {
        it('deve chamar callback com usuário quando autenticado', () => {
            const mockCallback = jest.fn();
            const mockUnsubscribe = jest.fn();
            
            mockOnAuthStateChanged.mockImplementation((auth, callback) => {
                callback({
                    uid: 'user-123',
                    email: 'test@email.com',
                });
                return mockUnsubscribe;
            });

            const unsubscribe = service.onAuthStateChanged(mockCallback);

            expect(mockCallback).toHaveBeenCalledWith({
                id: 'user-123',
                email: 'test@email.com',
            });
            expect(unsubscribe).toBe(mockUnsubscribe);
        });

        it('deve chamar callback com null quando não autenticado', () => {
            const mockCallback = jest.fn();
            const mockUnsubscribe = jest.fn();
            
            mockOnAuthStateChanged.mockImplementation((auth, callback) => {
                callback(null);
                return mockUnsubscribe;
            });

            service.onAuthStateChanged(mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(null);
        });

        it('deve retornar email vazio quando email é null', () => {
            const mockCallback = jest.fn();
            
            mockOnAuthStateChanged.mockImplementation((auth, callback) => {
                callback({
                    uid: 'user-123',
                    email: null,
                });
                return jest.fn();
            });

            service.onAuthStateChanged(mockCallback);

            expect(mockCallback).toHaveBeenCalledWith({
                id: 'user-123',
                email: '',
            });
        });
    });
});
