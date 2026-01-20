import { renderHook, act, waitFor } from '@testing-library/react';
import usePendingRequestsViewModel from '@/viewmodel/nutritionist/usePendingRequestsViewModel';
import { IListPendingAppointmentsUseCase } from '@/usecase/appointment/list/iListPendingAppointmentsUseCase';
import { IAcceptAppointmentUseCase } from '@/usecase/appointment/status/iAcceptAppointmentUseCase';
import { IRejectAppointmentUseCase } from '@/usecase/appointment/status/iRejectAppointmentUseCase';
import { IGetUserByIdUseCase } from '@/usecase/user/iGetUserByIdUseCase';
import { IAppointmentPushNotificationUseCase } from '@/usecase/notifications/iAppointmentPushNotificationUseCase';
import Appointment from '@/model/entities/appointment';
import ValidationError from '@/model/errors/validationError';
import RepositoryError from '@/model/errors/repositoryError';

const createMockAppointment = (id: string, date: string = '2025-01-20'): Appointment => ({
    id,
    patientId: 'patient-1',
    nutritionistId: 'nutri-1',
    date,
    timeStart: '09:00',
    timeEnd: '11:00',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
});

describe('ViewModel de Solicitações Pendentes', () => {
    let mockListPendingAppointmentsUseCase: IListPendingAppointmentsUseCase;
    let mockAcceptUseCase: IAcceptAppointmentUseCase;
    let mockRejectUseCase: IRejectAppointmentUseCase;
    let mockGetUserByIdUseCase: IGetUserByIdUseCase;
    let mockAppointmentPushNotificationUseCase: IAppointmentPushNotificationUseCase;
    let unsubscribeMock: jest.Mock;

    beforeEach(() => {
        unsubscribeMock = jest.fn();

        mockListPendingAppointmentsUseCase = {
            listPendingByNutritionist: jest.fn(),
            subscribePendingByNutritionist: jest.fn().mockImplementation((id, callback) => {
                callback([]);
                return unsubscribeMock;
            }),
        };

        mockAcceptUseCase = {
            acceptAppointment: jest.fn(),
            prepareAcceptance: jest.fn(),
        };

        mockRejectUseCase = {
            rejectAppointment: jest.fn(),
            prepareRejection: jest.fn(),
        };

        mockGetUserByIdUseCase = {
            getById: jest.fn().mockResolvedValue({ id: 'patient-1', name: 'João Silva', email: 'joao@test.com', role: 'patient', createdAt: new Date() }),
        };
        mockAppointmentPushNotificationUseCase = {
            notify: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve iniciar com loading true', () => {
        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation(() => unsubscribeMock);

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                'nutri-1'
            )
        );

        expect(result.current.loading).toBe(true);
    });

    it('deve carregar consultas pendentes via listener', async () => {
        const appointments = [createMockAppointment('appt-1'), createMockAppointment('appt-2')];

        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            setTimeout(() => callback(appointments), 0);
            return unsubscribeMock;
        });

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                'nutri-1'
            )
        );

        await waitFor(() => {
            expect(result.current.pendingAppointments).toHaveLength(2);
        });

        expect(result.current.loading).toBe(false);
    });

    it('deve aceitar consulta com sucesso', async () => {
        const appointment = createMockAppointment('appt-1');
        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([appointment]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.acceptAppointment as jest.Mock).mockResolvedValue({ ...appointment, status: 'accepted' });

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                'nutri-1'
            )
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        let success: boolean = false;
        await act(async () => {
            success = await result.current.acceptAppointment('appt-1');
        });

        expect(success).toBe(true);
        expect(result.current.successMessage).toBe('Consulta aceita com sucesso!');
        expect(mockAcceptUseCase.acceptAppointment).toHaveBeenCalledWith('appt-1');
    });

    it('deve tratar erro ao aceitar consulta', async () => {
        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.acceptAppointment as jest.Mock).mockRejectedValue(new ValidationError('Já existe consulta'));

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                'nutri-1'
            )
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        let success: boolean = true;
        await act(async () => {
            success = await result.current.acceptAppointment('appt-1');
        });

        expect(success).toBe(false);
        expect(result.current.error).toBe('Já existe consulta');
    });

    it('deve recusar consulta com sucesso', async () => {
        const appointment = createMockAppointment('appt-1');
        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([appointment]);
            return unsubscribeMock;
        });
        (mockRejectUseCase.rejectAppointment as jest.Mock).mockResolvedValue({ ...appointment, status: 'rejected' });

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                'nutri-1'
            )
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        let success: boolean = false;
        await act(async () => {
            success = await result.current.rejectAppointment('appt-1');
        });

        expect(success).toBe(true);
        expect(result.current.successMessage).toBe('Consulta recusada.');
        expect(mockRejectUseCase.rejectAppointment).toHaveBeenCalledWith('appt-1');
    });

    it('deve tratar RepositoryError', async () => {
        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.acceptAppointment as jest.Mock).mockRejectedValue(new RepositoryError('Erro de conexão'));

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                'nutri-1'
            )
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.acceptAppointment('appt-1');
        });

        expect(result.current.error).toBe('Erro de conexão');
    });

    it('deve limpar erro', async () => {
        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.acceptAppointment as jest.Mock).mockRejectedValue(new ValidationError('Erro'));

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                'nutri-1'
            )
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.acceptAppointment('appt-1');
        });

        expect(result.current.error).not.toBeNull();

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBeNull();
    });

    it('deve limpar mensagem de sucesso', async () => {
        const appointment = createMockAppointment('appt-1');
        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([appointment]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.acceptAppointment as jest.Mock).mockResolvedValue({ ...appointment, status: 'accepted' });

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                'nutri-1'
            )
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.acceptAppointment('appt-1');
        });

        expect(result.current.successMessage).not.toBeNull();

        act(() => {
            result.current.clearSuccess();
        });

        expect(result.current.successMessage).toBeNull();
    });

    it('deve chamar unsubscribe ao desmontar', async () => {
        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });

        const { unmount } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                'nutri-1'
            )
        );

        unmount();

        expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('deve retornar cedo quando nutritionistId é vazio', () => {
        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                ''
            )
        );

        expect(result.current.loading).toBe(false);
        expect(mockListPendingAppointmentsUseCase.subscribePendingByNutritionist).not.toHaveBeenCalled();
    });

    it('deve ignorar erro ao enviar notificação no accept', async () => {
        const appointment = createMockAppointment('appt-1');
        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([appointment]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.acceptAppointment as jest.Mock).mockResolvedValue({ ...appointment, status: 'accepted' });
        (mockAppointmentPushNotificationUseCase.notify as jest.Mock).mockRejectedValue(new Error('Notification failed'));

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                'nutri-1'
            )
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        let success: boolean = false;
        await act(async () => {
            success = await result.current.acceptAppointment('appt-1');
        });

        expect(success).toBe(true);
        expect(consoleSpy).toHaveBeenCalledWith('Falha ao enviar notificacao de aceite:', expect.any(Error));

        consoleSpy.mockRestore();
    });

    it('deve ignorar erro ao enviar notificação no reject', async () => {
        const appointment = createMockAppointment('appt-1');
        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([appointment]);
            return unsubscribeMock;
        });
        (mockRejectUseCase.rejectAppointment as jest.Mock).mockResolvedValue({ ...appointment, status: 'rejected' });
        (mockAppointmentPushNotificationUseCase.notify as jest.Mock).mockRejectedValue(new Error('Notification failed'));

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                'nutri-1'
            )
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        let success: boolean = false;
        await act(async () => {
            success = await result.current.rejectAppointment('appt-1');
        });

        expect(success).toBe(true);
        expect(consoleSpy).toHaveBeenCalledWith('Falha ao enviar notificacao de recusa:', expect.any(Error));

        consoleSpy.mockRestore();
    });

    it('deve tratar erro genérico ao aceitar consulta', async () => {
        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.acceptAppointment as jest.Mock).mockRejectedValue(new Error('Generic error'));

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                'nutri-1'
            )
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        let success: boolean = true;
        await act(async () => {
            success = await result.current.acceptAppointment('appt-1');
        });

        expect(success).toBe(false);
        expect(result.current.error).toBe('Erro ao aceitar consulta. Tente novamente.');
    });

    it('deve tratar erro genérico ao recusar consulta', async () => {
        (mockListPendingAppointmentsUseCase.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });
        (mockRejectUseCase.rejectAppointment as jest.Mock).mockRejectedValue(new Error('Generic error'));

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockListPendingAppointmentsUseCase,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockGetUserByIdUseCase,
                mockAppointmentPushNotificationUseCase,
                'nutri-1'
            )
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        let success: boolean = true;
        await act(async () => {
            success = await result.current.rejectAppointment('appt-1');
        });

        expect(success).toBe(false);
        expect(result.current.error).toBe('Erro ao recusar consulta. Tente novamente.');
    });
});
