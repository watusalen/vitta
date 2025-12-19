import { renderHook, act } from '@testing-library/react';
import useSignUpViewModel from '@/viewmodel/auth/useSignUpViewModel';
import { IAuthUseCases } from '@/usecase/auth/iAuthUseCases';
import AuthError from '@/model/errors/authError';
import ValidationError from '@/model/errors/validationError';
import RepositoryError from '@/model/errors/repositoryError';
import User from '@/model/entities/user';

describe('useSignUpViewModel', () => {
    let mockAuthUseCases: IAuthUseCases;

    beforeEach(() => {
        mockAuthUseCases = {
            login: jest.fn(),
            signUp: jest.fn(),
            logout: jest.fn(),
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
        const { result } = renderHook(() => useSignUpViewModel(mockAuthUseCases));

        expect(result.current.user).toBeNull();
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.isRegistered).toBe(false);
    });

    it('deve fazer signup com sucesso', async () => {
        (mockAuthUseCases.signUp as jest.Mock).mockResolvedValue(mockUser);

        const { result } = renderHook(() => useSignUpViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.signUp('John Doe', 'john@email.com', 'password123');
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isRegistered).toBe(true);
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(mockAuthUseCases.signUp).toHaveBeenCalledWith('John Doe', 'john@email.com', 'password123');
    });

    it('deve setar loading durante signup', async () => {
        let resolveSignUp: (value: User) => void;
        (mockAuthUseCases.signUp as jest.Mock).mockImplementation(() => new Promise((resolve) => {
            resolveSignUp = resolve;
        }));

        const { result } = renderHook(() => useSignUpViewModel(mockAuthUseCases));

        act(() => {
            result.current.signUp('John Doe', 'john@email.com', 'password123');
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            resolveSignUp!(mockUser);
        });

        expect(result.current.loading).toBe(false);
    });

    it('deve tratar ValidationError', async () => {
        (mockAuthUseCases.signUp as jest.Mock).mockRejectedValue(new ValidationError('Email inválido'));

        const { result } = renderHook(() => useSignUpViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.signUp('John', 'invalid', 'password123');
        });

        expect(result.current.error).toBe('Email inválido');
        expect(result.current.user).toBeNull();
        expect(result.current.isRegistered).toBe(false);
    });

    it('deve tratar AuthError', async () => {
        (mockAuthUseCases.signUp as jest.Mock).mockRejectedValue(new AuthError('Conta já existe'));

        const { result } = renderHook(() => useSignUpViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.signUp('John', 'existing@email.com', 'password');
        });

        expect(result.current.error).toBe('Conta já existe');
    });

    it('deve tratar RepositoryError', async () => {
        (mockAuthUseCases.signUp as jest.Mock).mockRejectedValue(new RepositoryError('Erro ao salvar'));

        const { result } = renderHook(() => useSignUpViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.signUp('John', 'john@email.com', 'password');
        });

        expect(result.current.error).toBe('Erro ao salvar');
    });

    it('deve tratar Error genérico', async () => {
        (mockAuthUseCases.signUp as jest.Mock).mockRejectedValue(new Error('Algo deu errado'));

        const { result } = renderHook(() => useSignUpViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.signUp('John', 'john@email.com', 'password');
        });

        expect(result.current.error).toBe('Algo deu errado');
    });

    it('deve tratar erro desconhecido', async () => {
        (mockAuthUseCases.signUp as jest.Mock).mockRejectedValue('string error');

        const { result } = renderHook(() => useSignUpViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.signUp('John', 'john@email.com', 'password');
        });

        expect(result.current.error).toBe('Erro desconhecido ao criar conta');
    });

    it('deve limpar erro com clearError', async () => {
        (mockAuthUseCases.signUp as jest.Mock).mockRejectedValue(new AuthError('Erro'));

        const { result } = renderHook(() => useSignUpViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.signUp('John', 'john@email.com', 'password');
        });

        expect(result.current.error).not.toBeNull();

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBeNull();
    });
});
