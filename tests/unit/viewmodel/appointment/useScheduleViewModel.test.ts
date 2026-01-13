import { renderHook, act } from '@testing-library/react';
import useScheduleViewModel from '@/viewmodel/appointment/useScheduleViewModel';
import { IGetAvailableTimeSlotsUseCase } from '@/usecase/appointment/availability/iGetAvailableTimeSlotsUseCase';
import { IRequestAppointmentUseCase } from '@/usecase/appointment/request/iRequestAppointmentUseCase';
import ErroValidacao from '@/model/errors/validationError';
import ErroRepositorio from '@/model/errors/repositoryError';
import TimeSlot from '@/model/entities/timeSlot';
import Appointment from '@/model/entities/appointment';
import { IGetNutritionistUseCase } from '@/usecase/user/iGetNutritionistUseCase';
import { IAppointmentPushNotificationUseCase } from '@/usecase/notifications/iAppointmentPushNotificationUseCase';

describe('ViewModel de Agendamento de Consultas', () => {
    let mockCasoDeUsoHorariosDisponiveis: IGetAvailableTimeSlotsUseCase;
    let mockCasoDeUsoSolicitarConsulta: IRequestAppointmentUseCase;
    let mockCasoDeUsoObterNutricionista: IGetNutritionistUseCase;
    let mockCasoDeUsoNotificacaoConsulta: IAppointmentPushNotificationUseCase;

    beforeEach(() => {
        mockCasoDeUsoHorariosDisponiveis = {
            listAvailableSlots: jest.fn(),
            listAvailableSlotsForRange: jest.fn(),
            hasAvailabilityOnDate: jest.fn(),
        };
        mockCasoDeUsoSolicitarConsulta = {
            requestAppointment: jest.fn(),
            prepareRequest: jest.fn(),
        };
        mockCasoDeUsoObterNutricionista = {
            getNutritionist: jest.fn(),
        };
        mockCasoDeUsoNotificacaoConsulta = {
            notify: jest.fn(),
        };
    });

    const mockSlots: TimeSlot[] = [
        { date: '2024-01-15', timeStart: '09:00', timeEnd: '11:00', available: true },
        { date: '2024-01-15', timeStart: '11:00', timeEnd: '13:00', available: true },
    ];

    const mockAppointment: Appointment = {
        id: 'appt-123',
        patientId: 'patient-1',
        nutritionistId: 'nutri-1',
        date: '2024-01-15',
        timeStart: '09:00',
        timeEnd: '11:00',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('deve inicializar com estado padrão', () => {
        const { result } = renderHook(() =>
            useScheduleViewModel(mockCasoDeUsoHorariosDisponiveis, mockCasoDeUsoSolicitarConsulta, mockCasoDeUsoNotificacaoConsulta)
        );

        expect(result.current.selectedDate).toBeNull();
        expect(result.current.availableSlots).toEqual([]);
        expect(result.current.selectedSlot).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.submitting).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.successMessage).toBeNull();
    });

    it('deve selecionar data e carregar slots', async () => {
        (mockCasoDeUsoHorariosDisponiveis.listAvailableSlots as jest.Mock).mockResolvedValue(mockSlots);

        const { result } = renderHook(() =>
            useScheduleViewModel(mockCasoDeUsoHorariosDisponiveis, mockCasoDeUsoSolicitarConsulta, mockCasoDeUsoNotificacaoConsulta)
        );

        const testDate = new Date('2024-01-15');

        await act(async () => {
            await result.current.selectDate(testDate, 'nutri-1');
        });

        expect(result.current.selectedDate).toEqual(testDate);
        expect(result.current.availableSlots).toEqual(mockSlots);
        expect(mockCasoDeUsoHorariosDisponiveis.listAvailableSlots).toHaveBeenCalledWith(testDate, 'nutri-1', undefined);
    });

    it('deve tratar erro ao carregar slots', async () => {
        (mockCasoDeUsoHorariosDisponiveis.listAvailableSlots as jest.Mock).mockRejectedValue(new ErroRepositorio('Erro ao carregar'));

        const { result } = renderHook(() =>
            useScheduleViewModel(mockCasoDeUsoHorariosDisponiveis, mockCasoDeUsoSolicitarConsulta, mockCasoDeUsoNotificacaoConsulta)
        );

        await act(async () => {
            await result.current.selectDate(new Date(), 'nutri-1');
        });

        expect(result.current.error).toBe('Erro ao carregar');
        expect(result.current.availableSlots).toEqual([]);
    });

    it('deve selecionar slot', () => {
        const { result } = renderHook(() =>
            useScheduleViewModel(mockCasoDeUsoHorariosDisponiveis, mockCasoDeUsoSolicitarConsulta, mockCasoDeUsoNotificacaoConsulta)
        );

        act(() => {
            result.current.selectSlot(mockSlots[0]);
        });

        expect(result.current.selectedSlot).toEqual(mockSlots[0]);
    });

    it('deve retornar erro quando solicitar consulta sem data/slot', async () => {
        const { result } = renderHook(() =>
            useScheduleViewModel(mockCasoDeUsoHorariosDisponiveis, mockCasoDeUsoSolicitarConsulta, mockCasoDeUsoNotificacaoConsulta)
        );

        await act(async () => {
            const appointment = await result.current.requestAppointment('patient-1', 'nutri-1');
            expect(appointment).toBeNull();
        });

        expect(result.current.error).toBe('Selecione uma data e horário para continuar.');
    });

    it('deve solicitar consulta com sucesso', async () => {
        (mockCasoDeUsoHorariosDisponiveis.listAvailableSlots as jest.Mock).mockResolvedValue(mockSlots);
        (mockCasoDeUsoSolicitarConsulta.requestAppointment as jest.Mock).mockResolvedValue(mockAppointment);

        const { result } = renderHook(() =>
            useScheduleViewModel(mockCasoDeUsoHorariosDisponiveis, mockCasoDeUsoSolicitarConsulta, mockCasoDeUsoNotificacaoConsulta)
        );

        await act(async () => {
            await result.current.selectDate(new Date('2024-01-15'), 'nutri-1');
        });

        act(() => {
            result.current.selectSlot(mockSlots[0]);
        });

        await act(async () => {
            const appointment = await result.current.requestAppointment('patient-1', 'nutri-1');
            expect(appointment).toEqual(mockAppointment);
        });

        expect(result.current.successMessage).toBe('Consulta solicitada com sucesso! Aguarde a confirmação da nutricionista.');
        expect(result.current.selectedSlot).toBeNull();
    });

    it('deve tratar ErroValidacao ao solicitar consulta', async () => {
        (mockCasoDeUsoHorariosDisponiveis.listAvailableSlots as jest.Mock).mockResolvedValue(mockSlots);
        (mockCasoDeUsoSolicitarConsulta.requestAppointment as jest.Mock).mockRejectedValue(new ErroValidacao('Horário indisponível'));

        const { result } = renderHook(() =>
            useScheduleViewModel(mockCasoDeUsoHorariosDisponiveis, mockCasoDeUsoSolicitarConsulta, mockCasoDeUsoNotificacaoConsulta)
        );

        await act(async () => {
            await result.current.selectDate(new Date('2024-01-15'), 'nutri-1');
        });

        act(() => {
            result.current.selectSlot(mockSlots[0]);
        });

        await act(async () => {
            const appointment = await result.current.requestAppointment('patient-1', 'nutri-1');
            expect(appointment).toBeNull();
        });

        expect(result.current.error).toBe('Horário indisponível');
    });

    it('deve carregar disponibilidade do mês', async () => {
        const mockSlotsMap = new Map<string, TimeSlot[]>();
        mockSlotsMap.set('2099-01-15', mockSlots);
        mockSlotsMap.set('2099-01-16', []);

        (mockCasoDeUsoHorariosDisponiveis.listAvailableSlotsForRange as jest.Mock).mockResolvedValue(mockSlotsMap);

        const { result } = renderHook(() =>
            useScheduleViewModel(mockCasoDeUsoHorariosDisponiveis, mockCasoDeUsoSolicitarConsulta, mockCasoDeUsoNotificacaoConsulta)
        );

        await act(async () => {
            await result.current.loadMonthAvailability(2099, 1, 'nutri-1');
        });

        expect(result.current.availabilityMap.get('2099-01-15')).toBe(true);
        expect(result.current.availabilityMap.get('2099-01-16')).toBe(false);
    });

    it('deve limpar erro', () => {
        const { result } = renderHook(() =>
            useScheduleViewModel(mockCasoDeUsoHorariosDisponiveis, mockCasoDeUsoSolicitarConsulta, mockCasoDeUsoNotificacaoConsulta)
        );

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBeNull();
    });

    it('deve limpar mensagem de sucesso', () => {
        const { result } = renderHook(() =>
            useScheduleViewModel(mockCasoDeUsoHorariosDisponiveis, mockCasoDeUsoSolicitarConsulta, mockCasoDeUsoNotificacaoConsulta)
        );

        act(() => {
            result.current.clearSuccess();
        });

        expect(result.current.successMessage).toBeNull();
    });

    it('deve carregar nutricionista com sucesso', async () => {
        (mockCasoDeUsoObterNutricionista.getNutritionist as jest.Mock).mockResolvedValue({
            id: 'nutri-1',
            name: 'Ana',
            email: 'ana@email.com',
            role: 'nutritionist',
            createdAt: new Date(),
        });

        const { result } = renderHook(() =>
            useScheduleViewModel(
                mockCasoDeUsoHorariosDisponiveis,
                mockCasoDeUsoSolicitarConsulta,
                mockCasoDeUsoNotificacaoConsulta,
                mockCasoDeUsoObterNutricionista
            )
        );

        await act(async () => {
            await result.current.loadNutritionist();
        });

        expect(result.current.nutritionist?.id).toBe('nutri-1');
    });

    it('deve tratar erro ao carregar nutricionista', async () => {
        (mockCasoDeUsoObterNutricionista.getNutritionist as jest.Mock).mockRejectedValue(
            new ErroValidacao('Nutricionista inválida')
        );

        const { result } = renderHook(() =>
            useScheduleViewModel(
                mockCasoDeUsoHorariosDisponiveis,
                mockCasoDeUsoSolicitarConsulta,
                mockCasoDeUsoNotificacaoConsulta,
                mockCasoDeUsoObterNutricionista
            )
        );

        await act(async () => {
            await result.current.loadNutritionist();
        });

        expect(result.current.nutritionistError).toBe('Nutricionista inválida');
    });

    it('deve limpar erro de nutricionista', async () => {
        (mockCasoDeUsoObterNutricionista.getNutritionist as jest.Mock).mockRejectedValue(
            new ErroValidacao('Nutricionista inválida')
        );

        const { result } = renderHook(() =>
            useScheduleViewModel(
                mockCasoDeUsoHorariosDisponiveis,
                mockCasoDeUsoSolicitarConsulta,
                mockCasoDeUsoNotificacaoConsulta,
                mockCasoDeUsoObterNutricionista
            )
        );

        await act(async () => {
            await result.current.loadNutritionist();
        });

        act(() => {
            result.current.clearNutritionistError();
        });

        expect(result.current.nutritionistError).toBeNull();
    });

    it('deve navegar para trás', () => {
        const { result } = renderHook(() =>
            useScheduleViewModel(mockCasoDeUsoHorariosDisponiveis, mockCasoDeUsoSolicitarConsulta, mockCasoDeUsoNotificacaoConsulta)
        );

        act(() => {
            result.current.goBack();
        });

        expect(result.current.navigationRoute).toBe('/patient-home');
        expect(result.current.navigationMethod).toBe('replace');
    });

    it('deve confirmar redirecionamento de sucesso', async () => {
        (mockCasoDeUsoHorariosDisponiveis.listAvailableSlots as jest.Mock).mockResolvedValue(mockSlots);
        (mockCasoDeUsoSolicitarConsulta.requestAppointment as jest.Mock).mockResolvedValue(mockAppointment);

        const { result } = renderHook(() =>
            useScheduleViewModel(mockCasoDeUsoHorariosDisponiveis, mockCasoDeUsoSolicitarConsulta, mockCasoDeUsoNotificacaoConsulta)
        );

        await act(async () => {
            await result.current.selectDate(new Date('2024-01-15'), 'nutri-1');
        });

        act(() => {
            result.current.selectSlot(mockSlots[0]);
        });

        await act(async () => {
            await result.current.requestAppointment('patient-1', 'nutri-1');
        });

        act(() => {
            result.current.confirmSuccessRedirect();
        });

        expect(result.current.navigationRoute).toBe('/my-appointments');
    });

    it('deve limpar navegação', () => {
        const { result } = renderHook(() =>
            useScheduleViewModel(mockCasoDeUsoHorariosDisponiveis, mockCasoDeUsoSolicitarConsulta, mockCasoDeUsoNotificacaoConsulta)
        );

        act(() => {
            result.current.goBack();
            result.current.clearNavigation();
        });

        expect(result.current.navigationRoute).toBeNull();
    });

});
