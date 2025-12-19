import { renderHook, act } from '@testing-library/react';
import useScheduleViewModel from '@/viewmodel/appointment/useScheduleViewModel';
import { IGetAvailableTimeSlotsUseCase } from '@/usecase/appointment/getAvailableTimeSlotsUseCase';
import { IRequestAppointmentUseCase } from '@/usecase/appointment/requestAppointmentUseCase';
import ValidationError from '@/model/errors/validationError';
import RepositoryError from '@/model/errors/repositoryError';
import TimeSlot from '@/model/entities/timeSlot';
import Appointment from '@/model/entities/appointment';

describe('useScheduleViewModel', () => {
    let mockGetAvailableTimeSlotsUseCase: IGetAvailableTimeSlotsUseCase;
    let mockRequestAppointmentUseCase: IRequestAppointmentUseCase;

    beforeEach(() => {
        mockGetAvailableTimeSlotsUseCase = {
            execute: jest.fn(),
            executeForRange: jest.fn(),
            hasAvailability: jest.fn(),
        };
        mockRequestAppointmentUseCase = {
            execute: jest.fn(),
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
            useScheduleViewModel(mockGetAvailableTimeSlotsUseCase, mockRequestAppointmentUseCase)
        );

        expect(result.current.selectedDate).toBeNull();
        expect(result.current.availableSlots).toEqual([]);
        expect(result.current.selectedSlot).toBeNull();
        expect(result.current.observations).toBe('');
        expect(result.current.loading).toBe(false);
        expect(result.current.submitting).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.successMessage).toBeNull();
    });

    it('deve selecionar data e carregar slots', async () => {
        (mockGetAvailableTimeSlotsUseCase.execute as jest.Mock).mockResolvedValue(mockSlots);

        const { result } = renderHook(() =>
            useScheduleViewModel(mockGetAvailableTimeSlotsUseCase, mockRequestAppointmentUseCase)
        );

        const testDate = new Date('2024-01-15');

        await act(async () => {
            await result.current.selectDate(testDate, 'nutri-1');
        });

        expect(result.current.selectedDate).toEqual(testDate);
        expect(result.current.availableSlots).toEqual(mockSlots);
        expect(mockGetAvailableTimeSlotsUseCase.execute).toHaveBeenCalledWith(testDate, 'nutri-1');
    });

    it('deve tratar erro ao carregar slots', async () => {
        (mockGetAvailableTimeSlotsUseCase.execute as jest.Mock).mockRejectedValue(new RepositoryError('Erro ao carregar'));

        const { result } = renderHook(() =>
            useScheduleViewModel(mockGetAvailableTimeSlotsUseCase, mockRequestAppointmentUseCase)
        );

        await act(async () => {
            await result.current.selectDate(new Date(), 'nutri-1');
        });

        expect(result.current.error).toBe('Erro ao carregar');
        expect(result.current.availableSlots).toEqual([]);
    });

    it('deve selecionar slot', () => {
        const { result } = renderHook(() =>
            useScheduleViewModel(mockGetAvailableTimeSlotsUseCase, mockRequestAppointmentUseCase)
        );

        act(() => {
            result.current.selectSlot(mockSlots[0]);
        });

        expect(result.current.selectedSlot).toEqual(mockSlots[0]);
    });

    it('deve definir observations', () => {
        const { result } = renderHook(() =>
            useScheduleViewModel(mockGetAvailableTimeSlotsUseCase, mockRequestAppointmentUseCase)
        );

        act(() => {
            result.current.setObservations('Minhas observações');
        });

        expect(result.current.observations).toBe('Minhas observações');
    });

    it('deve retornar erro quando solicitar consulta sem data/slot', async () => {
        const { result } = renderHook(() =>
            useScheduleViewModel(mockGetAvailableTimeSlotsUseCase, mockRequestAppointmentUseCase)
        );

        await act(async () => {
            const appointment = await result.current.requestAppointment('patient-1', 'nutri-1');
            expect(appointment).toBeNull();
        });

        expect(result.current.error).toBe('Selecione uma data e horário para continuar.');
    });

    it('deve solicitar consulta com sucesso', async () => {
        (mockGetAvailableTimeSlotsUseCase.execute as jest.Mock).mockResolvedValue(mockSlots);
        (mockRequestAppointmentUseCase.execute as jest.Mock).mockResolvedValue(mockAppointment);

        const { result } = renderHook(() =>
            useScheduleViewModel(mockGetAvailableTimeSlotsUseCase, mockRequestAppointmentUseCase)
        );

        await act(async () => {
            await result.current.selectDate(new Date('2024-01-15'), 'nutri-1');
        });

        act(() => {
            result.current.selectSlot(mockSlots[0]);
            result.current.setObservations('Teste');
        });

        await act(async () => {
            const appointment = await result.current.requestAppointment('patient-1', 'nutri-1');
            expect(appointment).toEqual(mockAppointment);
        });

        expect(result.current.successMessage).toBe('Consulta solicitada com sucesso! Aguarde a confirmação da nutricionista.');
        expect(result.current.selectedSlot).toBeNull();
        expect(result.current.observations).toBe('');
    });

    it('deve tratar ValidationError ao solicitar consulta', async () => {
        (mockGetAvailableTimeSlotsUseCase.execute as jest.Mock).mockResolvedValue(mockSlots);
        (mockRequestAppointmentUseCase.execute as jest.Mock).mockRejectedValue(new ValidationError('Horário indisponível'));

        const { result } = renderHook(() =>
            useScheduleViewModel(mockGetAvailableTimeSlotsUseCase, mockRequestAppointmentUseCase)
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
        mockSlotsMap.set('2024-01-15', mockSlots);
        mockSlotsMap.set('2024-01-16', []);

        (mockGetAvailableTimeSlotsUseCase.executeForRange as jest.Mock).mockResolvedValue(mockSlotsMap);

        const { result } = renderHook(() =>
            useScheduleViewModel(mockGetAvailableTimeSlotsUseCase, mockRequestAppointmentUseCase)
        );

        await act(async () => {
            await result.current.loadMonthAvailability(2024, 1, 'nutri-1');
        });

        expect(result.current.availabilityMap.get('2024-01-15')).toBe(true);
        expect(result.current.availabilityMap.get('2024-01-16')).toBe(false);
    });

    it('deve limpar erro', () => {
        const { result } = renderHook(() =>
            useScheduleViewModel(mockGetAvailableTimeSlotsUseCase, mockRequestAppointmentUseCase)
        );

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBeNull();
    });

    it('deve limpar mensagem de sucesso', () => {
        const { result } = renderHook(() =>
            useScheduleViewModel(mockGetAvailableTimeSlotsUseCase, mockRequestAppointmentUseCase)
        );

        act(() => {
            result.current.clearSuccess();
        });

        expect(result.current.successMessage).toBeNull();
    });

    it('deve resetar estado', async () => {
        (mockGetAvailableTimeSlotsUseCase.execute as jest.Mock).mockResolvedValue(mockSlots);

        const { result } = renderHook(() =>
            useScheduleViewModel(mockGetAvailableTimeSlotsUseCase, mockRequestAppointmentUseCase)
        );

        await act(async () => {
            await result.current.selectDate(new Date(), 'nutri-1');
        });

        act(() => {
            result.current.selectSlot(mockSlots[0]);
            result.current.setObservations('Test');
        });

        act(() => {
            result.current.reset();
        });

        expect(result.current.selectedDate).toBeNull();
        expect(result.current.availableSlots).toEqual([]);
        expect(result.current.selectedSlot).toBeNull();
        expect(result.current.observations).toBe('');
    });
});
