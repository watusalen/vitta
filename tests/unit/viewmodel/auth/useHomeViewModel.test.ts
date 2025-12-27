import { renderHook, act } from '@testing-library/react';
import useHomeViewModel from '@/viewmodel/auth/useHomeViewModel';
import { IAuthUseCases } from '@/usecase/auth/iAuthUseCases';
import AuthError from '@/model/errors/authError';
import User from '@/model/entities/user';

describe('useHomeViewModel', () => {
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

    it('deve inicializar com loading true', () => {
        const { result } = renderHook(() => useHomeViewModel(mockAuthUseCases));

        expect(result.current.user).toBeNull();
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(true);
    });

    it('deve escutar onAuthStateChanged e atualizar user', () => {
        let capturedCallback: ((user: User | null) => void) | null = null;

        (mockAuthUseCases.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
            capturedCallback = callback;
            return jest.fn();
        });

        const { result } = renderHook(() => useHomeViewModel(mockAuthUseCases));

        expect(mockAuthUseCases.onAuthStateChanged).toHaveBeenCalled();

        act(() => {
            capturedCallback!(mockUser);
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.loading).toBe(false);
    });

    it('deve setar user como null quando deslogado', () => {
        let capturedCallback: ((user: User | null) => void) | null = null;

        (mockAuthUseCases.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
            capturedCallback = callback;
            return jest.fn();
        });

        const { result } = renderHook(() => useHomeViewModel(mockAuthUseCases));

        act(() => {
            capturedCallback!(null);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('deve fazer logout com sucesso', async () => {
        (mockAuthUseCases.logout as jest.Mock).mockResolvedValue(undefined);
        let capturedCallback: ((user: User | null) => void) | null = null;

        (mockAuthUseCases.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
            capturedCallback = callback;
            return jest.fn();
        });

        const { result } = renderHook(() => useHomeViewModel(mockAuthUseCases));

        act(() => {
            capturedCallback!(mockUser);
        });

        expect(result.current.user).toEqual(mockUser);

        await act(async () => {
            await result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(result.current.error).toBeNull();
        expect(mockAuthUseCases.logout).toHaveBeenCalled();
    });

    it('deve tratar AuthError no logout', async () => {
        (mockAuthUseCases.logout as jest.Mock).mockRejectedValue(new AuthError('Erro no logout'));

        const { result } = renderHook(() => useHomeViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.logout();
        });

        expect(result.current.error).toBe('Erro no logout');
    });

    it('deve tratar erro desconhecido no logout', async () => {
        (mockAuthUseCases.logout as jest.Mock).mockRejectedValue(new Error('Unknown'));

        const { result } = renderHook(() => useHomeViewModel(mockAuthUseCases));

        await act(async () => {
            await result.current.logout();
        });

        expect(result.current.error).toBe('Erro ao fazer logout');
    });

    it('deve setar loading durante logout', async () => {
        let resolveLogout: (value?: unknown) => void;
        (mockAuthUseCases.logout as jest.Mock).mockImplementation(() => new Promise((resolve) => {
            resolveLogout = resolve;
        }));

        let capturedCallback: ((user: User | null) => void) | null = null;
        (mockAuthUseCases.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
            capturedCallback = callback;
            return jest.fn();
        });

        const { result } = renderHook(() => useHomeViewModel(mockAuthUseCases));

        act(() => {
            capturedCallback!(mockUser);
        });

        expect(result.current.loading).toBe(false);

        act(() => {
            result.current.logout();
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            resolveLogout!();
        });

        expect(result.current.loading).toBe(false);
    });

    it('deve fazer unsubscribe ao desmontar', () => {
        const mockUnsubscribe = jest.fn();
        (mockAuthUseCases.onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe);

        const { unmount } = renderHook(() => useHomeViewModel(mockAuthUseCases));

        unmount();

        expect(mockUnsubscribe).toHaveBeenCalled();
    });
});
