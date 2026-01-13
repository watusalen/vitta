import { renderHook, act, waitFor } from '@testing-library/react';
import usePendingRequestsViewModel from '@/viewmodel/nutritionist/usePendingRequestsViewModel';
import { IListPendingAppointmentsUseCase } from '@/usecase/appointment/list/iListPendingAppointmentsUseCase';
import { IAcceptAppointmentUseCase } from '@/usecase/appointment/status/iAcceptAppointmentUseCase';
import { IRejectAppointmentUseCase } from '@/usecase/appointment/status/iRejectAppointmentUseCase';
import { IGetUserByIdUseCase } from '@/usecase/user/iGetUserByIdUseCase';
import { IAppointmentCalendarSyncUseCase } from '@/usecase/calendar/iAppointmentCalendarSyncUseCase';
import { IAppointmentPushNotificationUseCase } from '@/usecase/notifications/iAppointmentPushNotificationUseCase';
import Appointment from '@/model/entities/appointment';
import ErroValidacao from '@/model/errors/validationError';
import ErroRepositorio from '@/model/errors/repositoryError';

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
    let mockCasoDeUsoListarConsultasPendentes: IListPendingAppointmentsUseCase;
    let mockAcceptUseCase: IAcceptAppointmentUseCase;
    let mockRejectUseCase: IRejectAppointmentUseCase;
    let mockCasoDeUsoObterUsuarioPorId: IGetUserByIdUseCase;
    let mockCalendarSyncUseCase: IAppointmentCalendarSyncUseCase;
    let mockCasoDeUsoNotificacaoConsulta: IAppointmentPushNotificationUseCase;
    let unsubscribeMock: jest.Mock;

    beforeEach(() => {
        unsubscribeMock = jest.fn();

        mockCasoDeUsoListarConsultasPendentes = {
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

        mockCasoDeUsoObterUsuarioPorId = {
            getById: jest.fn().mockResolvedValue({ id: 'patient-1', name: 'João Silva', email: 'joao@test.com', role: 'patient', createdAt: new Date() }),
        };
        mockCalendarSyncUseCase = {
            syncAccepted: jest.fn(),
            syncCancelledOrRejected: jest.fn(),
        };
        mockCasoDeUsoNotificacaoConsulta = {
            notify: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve iniciar com loading true', () => {
        (mockCasoDeUsoListarConsultasPendentes.subscribePendingByNutritionist as jest.Mock).mockImplementation(() => unsubscribeMock);

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockCasoDeUsoObterUsuarioPorId,
                mockCalendarSyncUseCase,
                mockCasoDeUsoNotificacaoConsulta,
                'nutri-1'
            )
        );

        expect(result.current.loading).toBe(true);
    });

    it('deve carregar consultas pendentes via listener', async () => {
        const appointments = [createMockAppointment('appt-1'), createMockAppointment('appt-2')];

        (mockCasoDeUsoListarConsultasPendentes.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            setTimeout(() => callback(appointments), 0);
            return unsubscribeMock;
        });

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockCasoDeUsoObterUsuarioPorId,
                mockCalendarSyncUseCase,
                mockCasoDeUsoNotificacaoConsulta,
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
        (mockCasoDeUsoListarConsultasPendentes.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([appointment]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.acceptAppointment as jest.Mock).mockResolvedValue({ ...appointment, status: 'accepted' });

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockCasoDeUsoObterUsuarioPorId,
                mockCalendarSyncUseCase,
                mockCasoDeUsoNotificacaoConsulta,
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
        expect(mockCalendarSyncUseCase.syncAccepted).toHaveBeenCalledWith(
            { ...appointment, status: 'accepted' },
            'nutritionist'
        );
    });

    it('deve tratar erro ao aceitar consulta', async () => {
        (mockCasoDeUsoListarConsultasPendentes.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.acceptAppointment as jest.Mock).mockRejectedValue(new ErroValidacao('Já existe consulta'));

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockCasoDeUsoObterUsuarioPorId,
                mockCalendarSyncUseCase,
                mockCasoDeUsoNotificacaoConsulta,
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
        (mockCasoDeUsoListarConsultasPendentes.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([appointment]);
            return unsubscribeMock;
        });
        (mockRejectUseCase.rejectAppointment as jest.Mock).mockResolvedValue({ ...appointment, status: 'rejected' });

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockCasoDeUsoObterUsuarioPorId,
                mockCalendarSyncUseCase,
                mockCasoDeUsoNotificacaoConsulta,
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

    it('deve tratar ErroRepositorio', async () => {
        (mockCasoDeUsoListarConsultasPendentes.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.acceptAppointment as jest.Mock).mockRejectedValue(new ErroRepositorio('Erro de conexão'));

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockCasoDeUsoObterUsuarioPorId,
                mockCalendarSyncUseCase,
                mockCasoDeUsoNotificacaoConsulta,
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
        (mockCasoDeUsoListarConsultasPendentes.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.acceptAppointment as jest.Mock).mockRejectedValue(new ErroValidacao('Erro'));

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockCasoDeUsoObterUsuarioPorId,
                mockCalendarSyncUseCase,
                mockCasoDeUsoNotificacaoConsulta,
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
        (mockCasoDeUsoListarConsultasPendentes.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([appointment]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.acceptAppointment as jest.Mock).mockResolvedValue({ ...appointment, status: 'accepted' });

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockCasoDeUsoObterUsuarioPorId,
                mockCalendarSyncUseCase,
                mockCasoDeUsoNotificacaoConsulta,
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
        (mockCasoDeUsoListarConsultasPendentes.subscribePendingByNutritionist as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });

        const { unmount } = renderHook(() =>
            usePendingRequestsViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockAcceptUseCase,
                mockRejectUseCase,
                mockCasoDeUsoObterUsuarioPorId,
                mockCalendarSyncUseCase,
                mockCasoDeUsoNotificacaoConsulta,
                'nutri-1'
            )
        );

        unmount();

        expect(unsubscribeMock).toHaveBeenCalled();
    });
});
