import { renderHook, act } from '@testing-library/react';
import useLoginViewModel from '@/viewmodel/auth/useLoginViewModel';
import { IAuthUseCases } from '@/usecase/auth/iAuthUseCases';
import ErroAuth from '@/model/errors/authError';
import ErroValidacao from '@/model/errors/validationError';
import ErroRepositorio from '@/model/errors/repositoryError';
import User from '@/model/entities/user';

describe('ViewModel de Login', () => {
    let mockCasosDeUsoAuth: IAuthUseCases;

    beforeEach(() => {
        mockCasosDeUsoAuth = {
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
        const { result } = renderHook(() => useLoginViewModel(mockCasosDeUsoAuth));

        expect(result.current.user).toBeNull();
        expect(result.current.error).toBeNull();
        expect(result.current.emailError).toBeNull();
        expect(result.current.passwordError).toBeNull();
        expect(result.current.resetLoading).toBe(false);
        expect(result.current.resetSuccess).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('deve fazer login com sucesso', async () => {
        (mockCasosDeUsoAuth.login as jest.Mock).mockResolvedValue(mockUser);

        const { result } = renderHook(() => useLoginViewModel(mockCasosDeUsoAuth));

        await act(async () => {
            await result.current.login('john@email.com', 'password123');
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('deve setar loading durante login', async () => {
        let resolveLogin: (value: User) => void;
        (mockCasosDeUsoAuth.login as jest.Mock).mockImplementation(() => new Promise((resolve) => {
            resolveLogin = resolve;
        }));

        const { result } = renderHook(() => useLoginViewModel(mockCasosDeUsoAuth));

        act(() => {
            result.current.login('john@email.com', 'password123');
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            resolveLogin!(mockUser);
        });

        expect(result.current.loading).toBe(false);
    });

    it('deve tratar ErroValidacao', async () => {
        (mockCasosDeUsoAuth.login as jest.Mock).mockRejectedValue(new ErroValidacao('Email inválido'));

        const { result } = renderHook(() => useLoginViewModel(mockCasosDeUsoAuth));

        await act(async () => {
            await result.current.login('invalid', 'password123');
        });

        expect(result.current.emailError).toBe('Email inválido');
        expect(result.current.user).toBeNull();
    });

    it('deve tratar ErroAuth', async () => {
        (mockCasosDeUsoAuth.login as jest.Mock).mockRejectedValue(new ErroAuth('Credenciais inválidas'));

        const { result } = renderHook(() => useLoginViewModel(mockCasosDeUsoAuth));

        await act(async () => {
            await result.current.login('john@email.com', 'wrong');
        });

        expect(result.current.error).toBe('Credenciais inválidas');
    });

    it('deve tratar ErroRepositorio', async () => {
        (mockCasosDeUsoAuth.login as jest.Mock).mockRejectedValue(new ErroRepositorio('Erro de conexão'));

        const { result } = renderHook(() => useLoginViewModel(mockCasosDeUsoAuth));

        await act(async () => {
            await result.current.login('john@email.com', 'password');
        });

        expect(result.current.error).toBe('Erro de conexão');
    });

    it('deve tratar erro desconhecido', async () => {
        (mockCasosDeUsoAuth.login as jest.Mock).mockRejectedValue(new Error('Unknown'));

        const { result } = renderHook(() => useLoginViewModel(mockCasosDeUsoAuth));

        await act(async () => {
            await result.current.login('john@email.com', 'password');
        });

        expect(result.current.error).toBe('Erro desconhecido ao fazer login');
    });

    it('deve limpar erro com clearError', async () => {
        (mockCasosDeUsoAuth.login as jest.Mock).mockRejectedValue(new ErroAuth('Erro'));

        const { result } = renderHook(() => useLoginViewModel(mockCasosDeUsoAuth));

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

        (mockCasosDeUsoAuth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
            capturedCallback = callback;
            return mockUnsubscribe;
        });

        const { result, unmount } = renderHook(() => useLoginViewModel(mockCasosDeUsoAuth));

        expect(mockCasosDeUsoAuth.onAuthStateChanged).toHaveBeenCalled();

        act(() => {
            capturedCallback!(mockUser);
        });

        expect(result.current.user).toEqual(mockUser);

        unmount();
        expect(mockUnsubscribe).toHaveBeenCalled();
    });
});
