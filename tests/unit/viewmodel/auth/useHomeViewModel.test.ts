import { renderHook, act } from '@testing-library/react';
import useHomeViewModel from '@/viewmodel/auth/useHomeViewModel';
import { IAuthUseCases } from '@/usecase/auth/iAuthUseCases';
import { ICalendarPermissionUseCase } from '@/usecase/calendar/iCalendarPermissionUseCase';
import { IPushPermissionUseCase } from '@/usecase/notifications/iPushPermissionUseCase';
import { IPushTokenUseCase } from '@/usecase/notifications/iPushTokenUseCase';
import AuthError from '@/model/errors/authError';
import User from '@/model/entities/user';

describe('useHomeViewModel', () => {
    let mockAuthUseCases: IAuthUseCases;
    let mockCalendarPermissionUseCase: ICalendarPermissionUseCase;
    let mockPushPermissionUseCase: IPushPermissionUseCase;
    let mockPushTokenUseCase: IPushTokenUseCase;

    beforeEach(() => {
        mockAuthUseCases = {
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
        mockPushPermissionUseCase = {
            checkPermission: jest.fn().mockResolvedValue('granted'),
            requestPermission: jest.fn().mockResolvedValue('granted'),
            openSettings: jest.fn().mockResolvedValue(undefined),
        };
        mockPushTokenUseCase = {
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
                mockAuthUseCases,
                mockCalendarPermissionUseCase,
                mockPushPermissionUseCase,
                mockPushTokenUseCase
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

        (mockAuthUseCases.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
            capturedCallback = callback;
            return jest.fn();
        });

        const { result } = renderHome();

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

        const { result } = renderHome();

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
        expect(mockAuthUseCases.logout).toHaveBeenCalled();
    });

    it('deve tratar AuthError no logout', async () => {
        (mockAuthUseCases.logout as jest.Mock).mockRejectedValue(new AuthError('Erro no logout'));

        const { result } = renderHome();

        await act(async () => {
            await result.current.logout();
        });

        expect(result.current.error).toBe('Erro no logout');
    });

    it('deve tratar erro desconhecido no logout', async () => {
        (mockAuthUseCases.logout as jest.Mock).mockRejectedValue(new Error('Unknown'));

        const { result } = renderHome();

        await act(async () => {
            await result.current.logout();
        });

        expect(result.current.error).toBe('Erro ao fazer logout');
    });

    it('deve setar loading durante logout', async () => {
        let resolveLogout: ((value?: unknown) => void) | undefined;
        (mockAuthUseCases.logout as jest.Mock).mockImplementation(() => new Promise((resolve) => {
            resolveLogout = resolve;
        }));

        let capturedCallback: ((user: User | null) => void) | null = null;
        (mockAuthUseCases.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
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
        (mockAuthUseCases.onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe);

        const { unmount } = renderHome();

        unmount();

        expect(mockUnsubscribe).toHaveBeenCalled();
    });
});
