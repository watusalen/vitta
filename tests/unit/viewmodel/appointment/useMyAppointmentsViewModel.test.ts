import { renderHook, act } from '@testing-library/react';
import useMyAppointmentsViewModel from '@/viewmodel/appointment/useMyAppointmentsViewModel';
import { IListPatientAppointmentsUseCase } from '@/usecase/appointment/list/iListPatientAppointmentsUseCase';
import { IAppointmentCalendarSyncUseCase } from '@/usecase/calendar/iAppointmentCalendarSyncUseCase';
import RepositoryError from '@/model/errors/repositoryError';
import Appointment from '@/model/entities/appointment';

describe('useMyAppointmentsViewModel', () => {
    let mockListPatientAppointmentsUseCase: IListPatientAppointmentsUseCase;
    let mockCalendarSyncUseCase: IAppointmentCalendarSyncUseCase;

    beforeEach(() => {
        mockListPatientAppointmentsUseCase = {
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
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        expect(result.current.loading).toBe(true);
        expect(result.current.appointments).toEqual([]);
    });

    it('deve carregar consultas na inicialização', async () => {
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockResolvedValue(mockAppointments);

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.appointments).toEqual(mockAppointments);
        expect(result.current.loading).toBe(false);
    });

    it('deve configurar subscription ao inicializar', () => {
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockResolvedValue([]);

        renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        expect(mockListPatientAppointmentsUseCase.subscribeToPatientAppointments).toHaveBeenCalledWith(
            'patient-1',
            expect.any(Function)
        );
    });

    it('deve fazer refresh', async () => {
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockResolvedValue(mockAppointments);

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            await result.current.refresh();
        });

        expect(result.current.refreshing).toBe(false);
        expect(mockListPatientAppointmentsUseCase.listByPatient).toHaveBeenCalled();
    });

    it('deve limpar erro', async () => {
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockRejectedValue(new RepositoryError('Erro'));

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
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

    it('deve tratar RepositoryError', async () => {
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockRejectedValue(new RepositoryError('Erro de conexão'));

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.error).toBe('Erro de conexão');
    });

    it('deve tratar erro genérico', async () => {
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockRejectedValue(new Error('Unknown'));

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.error).toBe('Erro ao carregar consultas.');
    });

    it('deve fazer unsubscribe ao desmontar', async () => {
        const mockUnsubscribe = jest.fn();
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockResolvedValue([]);
        (mockListPatientAppointmentsUseCase.subscribeToPatientAppointments as jest.Mock).mockReturnValue(mockUnsubscribe);

        const { unmount } = renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        unmount();

        expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('não deve carregar se patientId estiver vazio', async () => {
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockResolvedValue([]);

        renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, '')
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(mockListPatientAppointmentsUseCase.listByPatient).not.toHaveBeenCalled();
    });

    it('deve navegar para detalhes da consulta', () => {
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        act(() => {
            result.current.openAppointment('appt-1');
        });

        expect(result.current.navigationRoute).toBe('/appointment/appt-1');
        expect(result.current.navigationMethod).toBe('push');
    });

    it('deve voltar para home', () => {
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        act(() => {
            result.current.goBack();
        });

        expect(result.current.navigationRoute).toBe('/patient-home');
        expect(result.current.navigationMethod).toBe('replace');
    });

    it('deve limpar rota de navegação', () => {
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        act(() => {
            result.current.openAppointment('appt-1');
        });

        expect(result.current.navigationRoute).toBe('/appointment/appt-1');

        act(() => {
            result.current.clearNavigation();
        });

        expect(result.current.navigationRoute).toBeNull();
    });

    it('deve chamar syncAppointmentCalendar quando consulta é aceita', async () => {
        const acceptedAppointment: Appointment = {
            ...mockAppointments[0],
            status: 'accepted',
        };

        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockResolvedValue([]);
        let callSubscriberFn: ((appointments: Appointment[]) => void) | null = null;
        (mockListPatientAppointmentsUseCase.subscribeToPatientAppointments as jest.Mock).mockImplementation(
            (_patientId, callback) => {
                callSubscriberFn = callback;
                return jest.fn();
            }
        );
        (mockCalendarSyncUseCase.syncAccepted as jest.Mock).mockResolvedValue(undefined);

        renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            if (callSubscriberFn) {
                callSubscriberFn([acceptedAppointment]);
            }
        });

        expect(mockCalendarSyncUseCase.syncAccepted).toHaveBeenCalled();
    });

    it('deve não chamar syncCancelledOrRejected para rejected sem calendarEventIdPatient', async () => {
        const rejectedAppointment: Appointment = {
            ...mockAppointments[0],
            status: 'rejected',
            calendarEventIdPatient: undefined,
        };

        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockResolvedValue([]);
        let callSubscriberFn: ((appointments: Appointment[]) => void) | null = null;
        (mockListPatientAppointmentsUseCase.subscribeToPatientAppointments as jest.Mock).mockImplementation(
            (_patientId, callback) => {
                callSubscriberFn = callback;
                return jest.fn();
            }
        );

        renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            if (callSubscriberFn) {
                callSubscriberFn([rejectedAppointment]);
            }
        });

        expect(mockCalendarSyncUseCase.syncCancelledOrRejected).not.toHaveBeenCalled();
    });

    it('deve fazer refresh e resetar refreshing', async () => {
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockResolvedValue(mockAppointments);

        const { result } = renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        await act(async () => {
            await result.current.refresh();
        });

        expect(result.current.refreshing).toBe(false);
        expect(result.current.appointments).toEqual(mockAppointments);
    });

    it('deve manter callbacks estáveis entre re-renders', () => {
        (mockListPatientAppointmentsUseCase.listByPatient as jest.Mock).mockResolvedValue([]);

        const { result, rerender } = renderHook(() =>
            useMyAppointmentsViewModel(mockListPatientAppointmentsUseCase, mockCalendarSyncUseCase, 'patient-1')
        );

        const firstClearError = result.current.clearError;
        const firstOpenAppointment = result.current.openAppointment;
        const firstGoBack = result.current.goBack;

        rerender();

        expect(result.current.clearError).toBe(firstClearError);
        expect(result.current.openAppointment).toBe(firstOpenAppointment);
        expect(result.current.goBack).toBe(firstGoBack);
    });
});
