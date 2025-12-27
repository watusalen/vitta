import { renderHook, act } from '@testing-library/react';
import useAppointmentDetailsViewModel from '@/viewmodel/appointment/useAppointmentDetailsViewModel';
import { IGetAppointmentDetailsUseCase } from '@/usecase/appointment/details/iGetAppointmentDetailsUseCase';
import RepositoryError from '@/model/errors/repositoryError';
import Appointment from '@/model/entities/appointment';

describe('useAppointmentDetailsViewModel', () => {
    let mockGetAppointmentDetailsUseCase: IGetAppointmentDetailsUseCase;

    beforeEach(() => {
        mockGetAppointmentDetailsUseCase = {
            getById: jest.fn(),
        };
    });

    const mockAppointment: Appointment = {
        id: 'appt-123',
        patientId: 'patient-1',
        nutritionistId: 'nutri-1',
        date: '2024-01-15',
        timeStart: '09:00',
        timeEnd: '11:00',
        status: 'pending',
        observations: 'Observação de teste',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('deve inicializar com estado padrão', () => {
        const { result } = renderHook(() =>
            useAppointmentDetailsViewModel(mockGetAppointmentDetailsUseCase)
        );

        expect(result.current.appointment).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.notFound).toBe(false);
    });

    it('deve carregar detalhes da consulta', async () => {
        (mockGetAppointmentDetailsUseCase.getById as jest.Mock).mockResolvedValue(mockAppointment);

        const { result } = renderHook(() =>
            useAppointmentDetailsViewModel(mockGetAppointmentDetailsUseCase)
        );

        await act(async () => {
            await result.current.loadAppointment('appt-123');
        });

        expect(result.current.appointment).toEqual(mockAppointment);
        expect(result.current.loading).toBe(false);
        expect(result.current.notFound).toBe(false);
    });

    it('deve setar loading durante carregamento', async () => {
        let resolveLoad: (value: Appointment) => void;
        (mockGetAppointmentDetailsUseCase.getById as jest.Mock).mockImplementation(() =>
            new Promise((resolve) => {
                resolveLoad = resolve;
            })
        );

        const { result } = renderHook(() =>
            useAppointmentDetailsViewModel(mockGetAppointmentDetailsUseCase)
        );

        act(() => {
            result.current.loadAppointment('appt-123');
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            resolveLoad!(mockAppointment);
        });

        expect(result.current.loading).toBe(false);
    });

    it('deve setar notFound quando consulta não existe', async () => {
        (mockGetAppointmentDetailsUseCase.getById as jest.Mock).mockResolvedValue(null);

        const { result } = renderHook(() =>
            useAppointmentDetailsViewModel(mockGetAppointmentDetailsUseCase)
        );

        await act(async () => {
            await result.current.loadAppointment('non-existent');
        });

        expect(result.current.appointment).toBeNull();
        expect(result.current.notFound).toBe(true);
    });

    it('deve tratar RepositoryError', async () => {
        (mockGetAppointmentDetailsUseCase.getById as jest.Mock).mockRejectedValue(
            new RepositoryError('Erro ao carregar')
        );

        const { result } = renderHook(() =>
            useAppointmentDetailsViewModel(mockGetAppointmentDetailsUseCase)
        );

        await act(async () => {
            await result.current.loadAppointment('appt-123');
        });

        expect(result.current.error).toBe('Erro ao carregar');
        expect(result.current.appointment).toBeNull();
    });

    it('deve tratar erro genérico', async () => {
        (mockGetAppointmentDetailsUseCase.getById as jest.Mock).mockRejectedValue(new Error('Unknown'));

        const { result } = renderHook(() =>
            useAppointmentDetailsViewModel(mockGetAppointmentDetailsUseCase)
        );

        await act(async () => {
            await result.current.loadAppointment('appt-123');
        });

        expect(result.current.error).toBe('Erro ao carregar detalhes da consulta.');
    });

    it('deve limpar erro', async () => {
        (mockGetAppointmentDetailsUseCase.getById as jest.Mock).mockRejectedValue(
            new RepositoryError('Erro')
        );

        const { result } = renderHook(() =>
            useAppointmentDetailsViewModel(mockGetAppointmentDetailsUseCase)
        );

        await act(async () => {
            await result.current.loadAppointment('appt-123');
        });

        expect(result.current.error).not.toBeNull();

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBeNull();
    });
});
