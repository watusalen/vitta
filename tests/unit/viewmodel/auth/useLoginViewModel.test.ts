import { renderHook, act } from '@testing-library/react';
import useLoginViewModel from '@/viewmodel/auth/useLoginViewModel';
import { IAuthUseCases } from '@/usecase/auth/iAuthUseCases';
import AuthError from '@/model/errors/authError';
import ValidationError from '@/model/errors/validationError';
import RepositoryError from '@/model/errors/repositoryError';
import User from '@/model/entities/user';

describe('useLoginViewModel', () => {
    let mockAuthUseCases: IAuthUseCases;

    beforeEach(() => {
        mockAuthUseCases = {
            login: jest.fn(),
            signUp: jest.fn(),
            logout: jest.fn(),
            resetPassword: jest.fn(),
            onAuthStateChanged: jest.fn().mockReturnValue(jest.fn()),
        };
    });

    const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@email.com',
        role: 'patient',
        createdAt: new Date(),
    };

    it('deve inicializar com estado padrão', () => {
        const { result } = renderHook(() => useLoginViewModel(mockAuthUseCases));

        expect(result.current.user).toBeNull();
        expect(result.current.error).toBeNull();
        expect(result.current.emailError).toBeNull();
        expect(result.current.passwordError).toBeNull();
        expect(result.current.resetLoading).toBe(false);
        expect(result.current.resetSuccess).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('deve fazer login com sucesso', async () => {
        (mockAuthUseCases.login as jest.Mock).mockResolvedValue(mockUser);

        const { result } = renderHook(() => useLoginViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.login('john@email.com', 'password123');
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('deve setar loading durante login', async () => {
        let resolveLogin: (value: User) => void;
        (mockAuthUseCases.login as jest.Mock).mockImplementation(() => new Promise((resolve) => {
            resolveLogin = resolve;
        }));

        const { result } = renderHook(() => useLoginViewModel(mockAuthUseCases));

        act(() => {
            result.current.login('john@email.com', 'password123');
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            resolveLogin!(mockUser);
        });

        expect(result.current.loading).toBe(false);
    });

    it('deve tratar ValidationError', async () => {
        (mockAuthUseCases.login as jest.Mock).mockRejectedValue(new ValidationError('Email inválido'));

        const { result } = renderHook(() => useLoginViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.login('invalid', 'password123');
        });

        expect(result.current.emailError).toBe('Email inválido');
        expect(result.current.user).toBeNull();
    });

    it('deve tratar AuthError', async () => {
        (mockAuthUseCases.login as jest.Mock).mockRejectedValue(new AuthError('Credenciais inválidas'));

        const { result } = renderHook(() => useLoginViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.login('john@email.com', 'wrong');
        });

        expect(result.current.error).toBe('Credenciais inválidas');
    });

    it('deve tratar RepositoryError', async () => {
        (mockAuthUseCases.login as jest.Mock).mockRejectedValue(new RepositoryError('Erro de conexão'));

        const { result } = renderHook(() => useLoginViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.login('john@email.com', 'password');
        });

        expect(result.current.error).toBe('Erro de conexão');
    });

    it('deve tratar erro desconhecido', async () => {
        (mockAuthUseCases.login as jest.Mock).mockRejectedValue(new Error('Unknown'));

        const { result } = renderHook(() => useLoginViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.login('john@email.com', 'password');
        });

        expect(result.current.error).toBe('Erro desconhecido ao fazer login');
    });

    it('deve limpar erro com clearError', async () => {
        (mockAuthUseCases.login as jest.Mock).mockRejectedValue(new AuthError('Erro'));

        const { result } = renderHook(() => useLoginViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.login('john@email.com', 'wrong');
        });

        expect(result.current.error).not.toBeNull();

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBeNull();
    });

    it('deve escutar onAuthStateChanged', () => {
        const mockUnsubscribe = jest.fn();
        let capturedCallback: ((user: User | null) => void) | null = null;

        (mockAuthUseCases.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
            capturedCallback = callback;
            return mockUnsubscribe;
        });

        const { result, unmount } = renderHook(() => useLoginViewModel(mockAuthUseCases));

        expect(mockAuthUseCases.onAuthStateChanged).toHaveBeenCalled();

        act(() => {
            capturedCallback!(mockUser);
        });

        expect(result.current.user).toEqual(mockUser);

        unmount();
        expect(mockUnsubscribe).toHaveBeenCalled();
    });
});
