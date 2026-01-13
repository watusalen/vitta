import { renderHook, act } from '@testing-library/react';
import useMyAppointmentsViewModel from '@/viewmodel/appointment/useMyAppointmentsViewModel';
import { IListPatientAppointmentsUseCase } from '@/usecase/appointment/list/iListPatientAppointmentsUseCase';
import { IAppointmentCalendarSyncUseCase } from '@/usecase/calendar/iAppointmentCalendarSyncUseCase';
import ErroRepositorio from '@/model/errors/repositoryError';
import Appointment from '@/model/entities/appointment';

describe('useMyAppointmentsViewModel', () => {
    let mockCasoDeUsoListarConsultasDoPaciente: IListPatientAppointmentsUseCase;
    let mockCalendarSyncUseCase: IAppointmentCalendarSyncUseCase;

    beforeEach(() => {
        mockCasoDeUsoListarConsultasDoPaciente = {
            listByPatient: jest.fn(),
            subscribeToPatientAppointments: jest.fn(() => jest.fn()),
        };
        mockCalendarSyncUseCase = {
            syncAccepted: jest.fn(),
            syncCancelledOrRejected: jest.fn(),
        };
    });

    const mockAppointments: Appointment[] = [
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
        {
            id: 'appt-2',
            patientId: 'patient-1',
            nutritionistId: 'nutri-1',
            date: '2024-01-16',
            timeStart: '11:00',
            timeEnd: '13:00',
            status: 'accepted',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    it('deve inicializar com loading true', () => {
        (mockCasoDeUsoListarConsultasDoPaciente.listByPatient as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockCasoDeUsoListarConsultasDoPaciente, mockCalendarSyncUseCase, 'patient-1')
        );

        expect(result.current.loading).toBe(true);
        expect(result.current.appointments).toEqual([]);
    });

    it('deve carregar consultas na inicialização', async () => {
        (mockCasoDeUsoListarConsultasDoPaciente.listByPatient as jest.Mock).mockResolvedValue(mockAppointments);

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockCasoDeUsoListarConsultasDoPaciente, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.appointments).toEqual(mockAppointments);
        expect(result.current.loading).toBe(false);
    });

    it('deve configurar subscription ao inicializar', () => {
        (mockCasoDeUsoListarConsultasDoPaciente.listByPatient as jest.Mock).mockResolvedValue([]);

        renderHook(() =>
            useMyAppointmentsViewModel(mockCasoDeUsoListarConsultasDoPaciente, mockCalendarSyncUseCase, 'patient-1')
        );

        expect(mockCasoDeUsoListarConsultasDoPaciente.subscribeToPatientAppointments).toHaveBeenCalledWith(
            'patient-1',
            expect.any(Function)
        );
    });

    it('deve fazer refresh', async () => {
        (mockCasoDeUsoListarConsultasDoPaciente.listByPatient as jest.Mock).mockResolvedValue(mockAppointments);

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockCasoDeUsoListarConsultasDoPaciente, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            await result.current.refresh();
        });

        expect(result.current.refreshing).toBe(false);
        expect(mockCasoDeUsoListarConsultasDoPaciente.listByPatient).toHaveBeenCalled();
    });

    it('deve limpar erro', async () => {
        (mockCasoDeUsoListarConsultasDoPaciente.listByPatient as jest.Mock).mockRejectedValue(new ErroRepositorio('Erro'));

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockCasoDeUsoListarConsultasDoPaciente, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.error).toBe('Erro');

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBeNull();
    });

    it('deve tratar ErroRepositorio', async () => {
        (mockCasoDeUsoListarConsultasDoPaciente.listByPatient as jest.Mock).mockRejectedValue(new ErroRepositorio('Erro de conexão'));

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockCasoDeUsoListarConsultasDoPaciente, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.error).toBe('Erro de conexão');
    });

    it('deve tratar erro genérico', async () => {
        (mockCasoDeUsoListarConsultasDoPaciente.listByPatient as jest.Mock).mockRejectedValue(new Error('Unknown'));

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockCasoDeUsoListarConsultasDoPaciente, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.error).toBe('Erro ao carregar consultas.');
    });

    it('deve fazer unsubscribe ao desmontar', async () => {
        const mockUnsubscribe = jest.fn();
        (mockCasoDeUsoListarConsultasDoPaciente.listByPatient as jest.Mock).mockResolvedValue([]);
        (mockCasoDeUsoListarConsultasDoPaciente.subscribeToPatientAppointments as jest.Mock).mockReturnValue(mockUnsubscribe);

        const { unmount } = renderHook(() =>
            useMyAppointmentsViewModel(mockCasoDeUsoListarConsultasDoPaciente, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        unmount();

        expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('não deve carregar se patientId estiver vazio', async () => {
        (mockCasoDeUsoListarConsultasDoPaciente.listByPatient as jest.Mock).mockResolvedValue([]);

        renderHook(() =>
            useMyAppointmentsViewModel(mockCasoDeUsoListarConsultasDoPaciente, mockCalendarSyncUseCase, '')
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(mockCasoDeUsoListarConsultasDoPaciente.listByPatient).not.toHaveBeenCalled();
    });
});
