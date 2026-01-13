import { renderHook, act } from '@testing-library/react';
import useHomeViewModel from '@/viewmodel/auth/useHomeViewModel';
import { IAuthUseCases } from '@/usecase/auth/iAuthUseCases';
import { ICalendarPermissionUseCase } from '@/usecase/calendar/iCalendarPermissionUseCase';
import { IPushPermissionUseCase } from '@/usecase/notifications/iPushPermissionUseCase';
import { IPushTokenUseCase } from '@/usecase/notifications/iPushTokenUseCase';
import ErroAuth from '@/model/errors/authError';
import User from '@/model/entities/user';

describe('ViewModel de Home - Autenticação', () => {
    let mockCasosDeUsoAuth: IAuthUseCases;
    let mockCalendarPermissionUseCase: ICalendarPermissionUseCase;
    let mockCasoDeUsoPermissaoPush: IPushPermissionUseCase;
    let mockCasoDeUsoTokenPush: IPushTokenUseCase;

    beforeEach(() => {
        mockCasosDeUsoAuth = {
            login: jest.fn(),
            signUp: jest.fn(),
            logout: jest.fn(),
            resetPassword: jest.fn(),
            onAuthStateChanged: jest.fn().mockReturnValue(jest.fn()),
        };
        mockCalendarPermissionUseCase = {
            checkPermission: jest.fn().mockResolvedValue('authorized'),
            requestPermission: jest.fn().mockResolvedValue('authorized'),
            openSettings: jest.fn().mockResolvedValue(undefined),
        };
        mockCasoDeUsoPermissaoPush = {
            checkPermission: jest.fn().mockResolvedValue('granted'),
            requestPermission: jest.fn().mockResolvedValue('granted'),
            openSettings: jest.fn().mockResolvedValue(undefined),
        };
        mockCasoDeUsoTokenPush = {
            register: jest.fn(),
            unregister: jest.fn(),
        };
    });

    const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@email.com',
        role: 'patient',
        createdAt: new Date(),
    };

    const renderHome = () =>
        renderHook(() =>
            useHomeViewModel(
                mockCasosDeUsoAuth,
                mockCalendarPermissionUseCase,
                mockCasoDeUsoPermissaoPush,
                mockCasoDeUsoTokenPush
            )
        );

    it('deve inicializar com loading true', () => {
        const { result } = renderHome();

        expect(result.current.user).toBeNull();
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(true);
    });

    it('deve escutar onAuthStateChanged e atualizar user', () => {
        let capturedCallback: ((user: User | null) => void) | null = null;

        (mockCasosDeUsoAuth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
            capturedCallback = callback;
            return jest.fn();
        });

        const { result } = renderHome();

        expect(mockCasosDeUsoAuth.onAuthStateChanged).toHaveBeenCalled();

        act(() => {
            capturedCallback!(mockUser);
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.loading).toBe(false);
    });

    it('deve setar user como null quando deslogado', () => {
        let capturedCallback: ((user: User | null) => void) | null = null;

        (mockCasosDeUsoAuth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
            capturedCallback = callback;
            return jest.fn();
        });

        const { result } = renderHome();

        act(() => {
            capturedCallback!(null);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('deve fazer logout com sucesso', async () => {
        (mockCasosDeUsoAuth.logout as jest.Mock).mockResolvedValue(undefined);
        let capturedCallback: ((user: User | null) => void) | null = null;

        (mockCasosDeUsoAuth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
            capturedCallback = callback;
            return jest.fn();
        });

        const { result } = renderHome();

        act(() => {
            capturedCallback!(mockUser);
        });

        expect(result.current.user).toEqual(mockUser);

        await act(async () => {
            await result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(result.current.error).toBeNull();
        expect(mockCasosDeUsoAuth.logout).toHaveBeenCalled();
    });

    it('deve tratar ErroAuth no logout', async () => {
        (mockCasosDeUsoAuth.logout as jest.Mock).mockRejectedValue(new ErroAuth('Erro no logout'));

        const { result } = renderHome();

        await act(async () => {
            await result.current.logout();
        });

        expect(result.current.error).toBe('Erro no logout');
    });

    it('deve tratar erro desconhecido no logout', async () => {
        (mockCasosDeUsoAuth.logout as jest.Mock).mockRejectedValue(new Error('Unknown'));

        const { result } = renderHome();

        await act(async () => {
            await result.current.logout();
        });

        expect(result.current.error).toBe('Erro ao fazer logout');
    });

    it('deve setar loading durante logout', async () => {
        let resolveLogout: ((value?: unknown) => void) | undefined;
        (mockCasosDeUsoAuth.logout as jest.Mock).mockImplementation(() => new Promise((resolve) => {
            resolveLogout = resolve;
        }));

        let capturedCallback: ((user: User | null) => void) | null = null;
        (mockCasosDeUsoAuth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
            capturedCallback = callback;
            return jest.fn();
        });

        const { result } = renderHome();

        act(() => {
            capturedCallback!(mockUser);
        });

        expect(result.current.loading).toBe(false);

        act(() => {
            result.current.logout();
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            resolveLogout!();
        });

        expect(result.current.loading).toBe(false);
    });

    it('deve fazer unsubscribe ao desmontar', () => {
        const mockUnsubscribe = jest.fn();
        (mockCasosDeUsoAuth.onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe);

        const { unmount } = renderHome();

        unmount();

        expect(mockUnsubscribe).toHaveBeenCalled();
    });
});
