import { renderHook, act, waitFor } from '@testing-library/react';
import useNutritionistAgendaViewModel from '@/viewmodel/nutritionist/useNutritionistAgendaViewModel';
import { IListNutritionistAgendaUseCase, AgendaByDate } from '@/usecase/appointment/list/iListNutritionistAgendaUseCase';
import { IGetUserByIdUseCase } from '@/usecase/user/iGetUserByIdUseCase';
import Appointment from '@/model/entities/appointment';
import RepositoryError from '@/model/errors/repositoryError';

// Helper para criar appointment mock
const createMockAppointment = (id: string, date: string, timeStart: string = '09:00'): Appointment => ({
    id,
    patientId: 'patient-1',
    nutritionistId: 'nutri-1',
    date,
    timeStart,
    timeEnd: '11:00',
    status: 'accepted',
    createdAt: new Date(),
    updatedAt: new Date(),
});

describe('useNutritionistAgendaViewModel', () => {
    let mockUseCase: IListNutritionistAgendaUseCase;
    let mockGetUserByIdUseCase: IGetUserByIdUseCase;

    beforeEach(() => {
        mockUseCase = {
            listAgenda: jest.fn().mockResolvedValue([]),
            listAcceptedByDate: jest.fn().mockResolvedValue([]),
            subscribeToNutritionistAppointments: jest.fn(() => () => {}),
        };

        mockGetUserByIdUseCase = {
            getById: jest.fn().mockResolvedValue({
                id: 'patient-1',
                name: 'João Silva',
                email: 'joao@test.com',
                role: 'patient',
                createdAt: new Date(),
            }),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve iniciar com loading true', () => {
        (mockUseCase.listAgenda as jest.Mock).mockImplementation(() => new Promise(() => {}));

        const { result } = renderHook(() =>
            useNutritionistAgendaViewModel(mockUseCase, mockGetUserByIdUseCase, 'nutri-1')
        );

        expect(result.current.loading).toBe(true);
    });

    it('deve carregar agenda ao montar', async () => {
        const agendaData: AgendaByDate[] = [
            {
                date: '2025-01-20',
                appointments: [createMockAppointment('appt-1', '2025-01-20')],
            },
        ];

        (mockUseCase.listAgenda as jest.Mock).mockResolvedValue(agendaData);

        const { result } = renderHook(() =>
            useNutritionistAgendaViewModel(mockUseCase, mockGetUserByIdUseCase, 'nutri-1')
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.markedDates.has('2025-01-20')).toBe(true);
    });

    it('deve selecionar data e carregar consultas formatadas', async () => {
        const appointments = [
            createMockAppointment('appt-1', '2025-01-20', '09:00'),
            createMockAppointment('appt-2', '2025-01-20', '11:00'),
        ];

        (mockUseCase.listAgenda as jest.Mock).mockResolvedValue([]);
        (mockUseCase.listAcceptedByDate as jest.Mock).mockResolvedValue(appointments);

        const { result } = renderHook(() =>
            useNutritionistAgendaViewModel(mockUseCase, mockGetUserByIdUseCase, 'nutri-1')
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.selectDate(new Date(2025, 0, 20, 12, 0, 0));
        });

        expect(result.current.selectedDate).toBeDefined();
        expect(result.current.selectedDateAppointments).toHaveLength(2);
        expect(result.current.selectedDateAppointments[0].patientName).toBe('João Silva');
        expect(result.current.selectedDateFormatted).toContain('20');
    });

    it('deve alterar filtro', async () => {
        (mockUseCase.listAgenda as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useNutritionistAgendaViewModel(mockUseCase, mockGetUserByIdUseCase, 'nutri-1')
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.setFilter('today');
        });

        expect(result.current.filter).toBe('today');
    });

    it('deve fazer refresh', async () => {
        (mockUseCase.listAgenda as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useNutritionistAgendaViewModel(mockUseCase, mockGetUserByIdUseCase, 'nutri-1')
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.refresh();
        });

        expect(mockUseCase.listAgenda).toHaveBeenCalledTimes(2); // inicial + refresh
    });

    it('deve tratar erro ao carregar agenda', async () => {
        (mockUseCase.listAgenda as jest.Mock).mockRejectedValue(new RepositoryError('Erro de conexão'));

        const { result } = renderHook(() =>
            useNutritionistAgendaViewModel(mockUseCase, mockGetUserByIdUseCase, 'nutri-1')
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Erro de conexão');
    });

    it('deve tentar novamente após erro com retry', async () => {
        (mockUseCase.listAgenda as jest.Mock)
            .mockRejectedValueOnce(new RepositoryError('Erro'))
            .mockResolvedValueOnce([]);

        const { result } = renderHook(() =>
            useNutritionistAgendaViewModel(mockUseCase, mockGetUserByIdUseCase, 'nutri-1')
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).not.toBeNull();

        await act(async () => {
            await result.current.retry();
        });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBeNull();
    });

    it('deve extrair datas marcadas corretamente', async () => {
        const agendaData: AgendaByDate[] = [
            { date: '2025-01-20', appointments: [createMockAppointment('appt-1', '2025-01-20')] },
            { date: '2025-01-22', appointments: [createMockAppointment('appt-2', '2025-01-22')] },
            { date: '2025-01-25', appointments: [createMockAppointment('appt-3', '2025-01-25')] },
        ];

        (mockUseCase.listAgenda as jest.Mock).mockResolvedValue(agendaData);

        const { result } = renderHook(() =>
            useNutritionistAgendaViewModel(mockUseCase, mockGetUserByIdUseCase, 'nutri-1')
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.markedDates.size).toBe(3);
        expect(result.current.markedDates.has('2025-01-20')).toBe(true);
        expect(result.current.markedDates.has('2025-01-22')).toBe(true);
        expect(result.current.markedDates.has('2025-01-25')).toBe(true);
    });

    it('deve retornar array vazio quando selecionar data sem consultas', async () => {
        (mockUseCase.listAgenda as jest.Mock).mockResolvedValue([]);
        (mockUseCase.listAcceptedByDate as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useNutritionistAgendaViewModel(mockUseCase, mockGetUserByIdUseCase, 'nutri-1')
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.selectDate(new Date(2025, 0, 20));
        });

        expect(result.current.selectedDateAppointments).toHaveLength(0);
    });

    it('deve formatar selectedDateFormatted quando data selecionada', async () => {
        (mockUseCase.listAgenda as jest.Mock).mockResolvedValue([]);
        (mockUseCase.listAcceptedByDate as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useNutritionistAgendaViewModel(mockUseCase, mockGetUserByIdUseCase, 'nutri-1')
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.selectedDateFormatted).toBe('');

        await act(async () => {
            await result.current.selectDate(new Date(2025, 0, 20, 12, 0, 0));
        });

        expect(result.current.selectedDateFormatted).not.toBe('');
        expect(result.current.selectedDateFormatted.toLowerCase()).toContain('janeiro');
    });
});
