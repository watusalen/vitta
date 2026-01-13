import { renderHook, act, waitFor } from '@testing-library/react';
import useNutritionistHomeViewModel from '@/viewmodel/nutritionist/useNutritionistHomeViewModel';
import { IListPendingAppointmentsUseCase } from '@/usecase/appointment/list/iListPendingAppointmentsUseCase';
import { IListNutritionistAgendaUseCase } from '@/usecase/appointment/list/iListNutritionistAgendaUseCase';
import { IGetUserByIdUseCase } from '@/usecase/user/iGetUserByIdUseCase';
import ErroRepositorio from '@/model/errors/repositoryError';
import Appointment from '@/model/entities/appointment';
import User from '@/model/entities/user';

describe('ViewModel de Home da Nutricionista', () => {
    let mockCasoDeUsoListarConsultasPendentes: IListPendingAppointmentsUseCase;
    let mockCasoDeUsoListarAgendaDaNutricionista: IListNutritionistAgendaUseCase;
    let mockCasoDeUsoObterUsuarioPorId: IGetUserByIdUseCase;

    beforeEach(() => {
        mockCasoDeUsoListarConsultasPendentes = {
            listPendingByNutritionist: jest.fn(),
            subscribePendingByNutritionist: jest.fn(() => jest.fn()),
        };

        mockCasoDeUsoListarAgendaDaNutricionista = {
            listAgenda: jest.fn(),
            listAcceptedByDate: jest.fn(),
            subscribeToNutritionistAppointments: jest.fn(() => () => {}),
        };

        mockCasoDeUsoObterUsuarioPorId = {
            getById: jest.fn(),
        };
    });

    const mockPendingAppointments: Appointment[] = [
        {
            id: 'appt-1',
            patientId: 'patient-1',
            nutritionistId: 'nutri-1',
            date: '2024-01-15',
            timeStart: '09:00',
            timeEnd: '11:00',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    const mockAcceptedAppointments: Appointment[] = [
        {
            id: 'appt-2',
            patientId: 'patient-1',
            nutritionistId: 'nutri-1',
            date: new Date().toISOString().split('T')[0],
            timeStart: '09:00',
            timeEnd: '11:00',
            status: 'accepted',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    const mockPatient: User = {
        id: 'patient-1',
        name: 'João Paciente',
        email: 'joao@email.com',
        role: 'patient',
        createdAt: new Date(),
    };

    it('deve inicializar com loading true', () => {
        (mockCasoDeUsoListarConsultasPendentes.listPendingByNutritionist as jest.Mock).mockResolvedValue([]);
        (mockCasoDeUsoListarAgendaDaNutricionista.listAcceptedByDate as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useNutritionistHomeViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockCasoDeUsoListarAgendaDaNutricionista,
                mockCasoDeUsoObterUsuarioPorId,
                'nutri-1'
            )
        );

        expect(result.current.loading).toBe(true);
    });

    it('deve carregar dados na inicialização', async () => {
        (mockCasoDeUsoListarConsultasPendentes.listPendingByNutritionist as jest.Mock).mockResolvedValue(mockPendingAppointments);
        (mockCasoDeUsoListarAgendaDaNutricionista.listAcceptedByDate as jest.Mock).mockResolvedValue(mockAcceptedAppointments);
        (mockCasoDeUsoObterUsuarioPorId.getById as jest.Mock).mockResolvedValue(mockPatient);

        const { result } = renderHook(() =>
            useNutritionistHomeViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockCasoDeUsoListarAgendaDaNutricionista,
                mockCasoDeUsoObterUsuarioPorId,
                'nutri-1'
            )
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.pendingCount).toBe(1);
        expect(result.current.todayAppointments).toHaveLength(1);
        expect(result.current.todayAppointments[0].patientName).toBe('João Paciente');
        expect(result.current.loading).toBe(false);
    });

    it('deve usar "Paciente" quando não encontrar nome', async () => {
        (mockCasoDeUsoListarConsultasPendentes.listPendingByNutritionist as jest.Mock).mockResolvedValue([]);
        (mockCasoDeUsoListarAgendaDaNutricionista.listAcceptedByDate as jest.Mock).mockResolvedValue(mockAcceptedAppointments);
        (mockCasoDeUsoObterUsuarioPorId.getById as jest.Mock).mockResolvedValue(null);

        const { result } = renderHook(() =>
            useNutritionistHomeViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockCasoDeUsoListarAgendaDaNutricionista,
                mockCasoDeUsoObterUsuarioPorId,
                'nutri-1'
            )
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.todayAppointments[0].patientName).toBe('Paciente');
    });

    it('deve tratar erro ao buscar nome do paciente', async () => {
        (mockCasoDeUsoListarConsultasPendentes.listPendingByNutritionist as jest.Mock).mockResolvedValue([]);
        (mockCasoDeUsoListarAgendaDaNutricionista.listAcceptedByDate as jest.Mock).mockResolvedValue(mockAcceptedAppointments);
        (mockCasoDeUsoObterUsuarioPorId.getById as jest.Mock).mockRejectedValue(new Error('Erro'));

        const { result } = renderHook(() =>
            useNutritionistHomeViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockCasoDeUsoListarAgendaDaNutricionista,
                mockCasoDeUsoObterUsuarioPorId,
                'nutri-1'
            )
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.todayAppointments[0].patientName).toBe('Paciente');
    });

    it('deve tratar ErroRepositorio', async () => {
        (mockCasoDeUsoListarConsultasPendentes.listPendingByNutritionist as jest.Mock).mockRejectedValue(new ErroRepositorio('Erro ao carregar'));
        (mockCasoDeUsoListarAgendaDaNutricionista.listAcceptedByDate as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useNutritionistHomeViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockCasoDeUsoListarAgendaDaNutricionista,
                mockCasoDeUsoObterUsuarioPorId,
                'nutri-1'
            )
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.error).toBe('Erro ao carregar');
    });

    it('deve tratar erro genérico', async () => {
        (mockCasoDeUsoListarConsultasPendentes.listPendingByNutritionist as jest.Mock).mockRejectedValue(new Error('Unknown'));
        (mockCasoDeUsoListarAgendaDaNutricionista.listAcceptedByDate as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useNutritionistHomeViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockCasoDeUsoListarAgendaDaNutricionista,
                mockCasoDeUsoObterUsuarioPorId,
                'nutri-1'
            )
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.error).toBe('Erro ao carregar dados.');
    });

    it('deve fazer refresh', async () => {
        (mockCasoDeUsoListarConsultasPendentes.listPendingByNutritionist as jest.Mock).mockResolvedValue([]);
        (mockCasoDeUsoListarAgendaDaNutricionista.listAcceptedByDate as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useNutritionistHomeViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockCasoDeUsoListarAgendaDaNutricionista,
                mockCasoDeUsoObterUsuarioPorId,
                'nutri-1'
            )
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        (mockCasoDeUsoListarConsultasPendentes.listPendingByNutritionist as jest.Mock).mockResolvedValue(mockPendingAppointments);

        await act(async () => {
            await result.current.refresh();
        });

        expect(result.current.pendingCount).toBe(1);
    });

    it('deve limpar erro', async () => {
        (mockCasoDeUsoListarConsultasPendentes.listPendingByNutritionist as jest.Mock).mockRejectedValue(new ErroRepositorio('Erro'));
        (mockCasoDeUsoListarAgendaDaNutricionista.listAcceptedByDate as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useNutritionistHomeViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockCasoDeUsoListarAgendaDaNutricionista,
                mockCasoDeUsoObterUsuarioPorId,
                'nutri-1'
            )
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.error).not.toBeNull();

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBeNull();
    });

    it('deve calcular hasAppointmentsToday corretamente', async () => {
        (mockCasoDeUsoListarConsultasPendentes.listPendingByNutritionist as jest.Mock).mockResolvedValue([]);
        (mockCasoDeUsoListarAgendaDaNutricionista.listAcceptedByDate as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useNutritionistHomeViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockCasoDeUsoListarAgendaDaNutricionista,
                mockCasoDeUsoObterUsuarioPorId,
                'nutri-1'
            )
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.hasAppointmentsToday).toBe(false);
    });

    it('deve mostrar empty state quando não há consultas', async () => {
        (mockCasoDeUsoListarConsultasPendentes.listPendingByNutritionist as jest.Mock).mockResolvedValue([]);
        (mockCasoDeUsoListarAgendaDaNutricionista.listAcceptedByDate as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useNutritionistHomeViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockCasoDeUsoListarAgendaDaNutricionista,
                mockCasoDeUsoObterUsuarioPorId,
                'nutri-1'
            )
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.showEmptyState).toBe(true);
    });

    it('deve esconder empty state após 3 segundos', async () => {
        jest.useFakeTimers();
        
        (mockCasoDeUsoListarConsultasPendentes.listPendingByNutritionist as jest.Mock).mockResolvedValue([]);
        (mockCasoDeUsoListarAgendaDaNutricionista.listAcceptedByDate as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useNutritionistHomeViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockCasoDeUsoListarAgendaDaNutricionista,
                mockCasoDeUsoObterUsuarioPorId,
                'nutri-1'
            )
        );

        await act(async () => {
            jest.runAllTimers();
        });

        expect(result.current.showEmptyState).toBe(true);

        await act(async () => {
            jest.advanceTimersByTime(3500);
        });

        expect(result.current.showEmptyState).toBe(false);
        
        jest.useRealTimers();
    });

    it('não deve carregar se nutritionistId estiver vazio', async () => {
        const { result } = renderHook(() =>
            useNutritionistHomeViewModel(
                mockCasoDeUsoListarConsultasPendentes,
                mockCasoDeUsoListarAgendaDaNutricionista,
                mockCasoDeUsoObterUsuarioPorId,
                ''
            )
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(mockCasoDeUsoListarConsultasPendentes.listPendingByNutritionist).not.toHaveBeenCalled();
    });
});
