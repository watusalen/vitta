import { renderHook, act, waitFor } from '@testing-library/react';
import usePendingRequestsViewModel from '@/viewmodel/nutritionist/usePendingRequestsViewModel';
import { IAppointmentRepository } from '@/model/repositories/iAppointmentRepository';
import { IAcceptAppointmentUseCase } from '@/usecase/appointment/acceptAppointmentUseCase';
import { IRejectAppointmentUseCase } from '@/usecase/appointment/rejectAppointmentUseCase';
import { IUserRepository } from '@/model/repositories/iUserRepository';
import Appointment from '@/model/entities/appointment';
import ValidationError from '@/model/errors/validationError';
import RepositoryError from '@/model/errors/repositoryError';

// Helper para criar appointment mock
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

describe('usePendingRequestsViewModel', () => {
    let mockRepository: IAppointmentRepository;
    let mockAcceptUseCase: IAcceptAppointmentUseCase;
    let mockRejectUseCase: IRejectAppointmentUseCase;
    let mockUserRepository: IUserRepository;
    let unsubscribeMock: jest.Mock;

    beforeEach(() => {
        unsubscribeMock = jest.fn();

        mockRepository = {
            create: jest.fn(),
            getById: jest.fn(),
            listByPatient: jest.fn(),
            listByDate: jest.fn(),
            listByStatus: jest.fn(),
            listAcceptedByDateRange: jest.fn(),
            updateStatus: jest.fn(),
            onPatientAppointmentsChange: jest.fn(),
            onNutritionistPendingChange: jest.fn().mockImplementation((id, callback) => {
                callback([]);
                return unsubscribeMock;
            }),
        };

        mockAcceptUseCase = {
            execute: jest.fn(),
        };

        mockRejectUseCase = {
            execute: jest.fn(),
        };

        mockUserRepository = {
            createUser: jest.fn(),
            getUserByID: jest.fn().mockResolvedValue({ id: 'patient-1', name: 'João Silva', email: 'joao@test.com', role: 'patient', createdAt: new Date() }),
            getByRole: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve iniciar com loading true', () => {
        (mockRepository.onNutritionistPendingChange as jest.Mock).mockImplementation(() => unsubscribeMock);

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(mockRepository, mockAcceptUseCase, mockRejectUseCase, mockUserRepository, 'nutri-1')
        );

        expect(result.current.loading).toBe(true);
    });

    it('deve carregar consultas pendentes via listener', async () => {
        const appointments = [createMockAppointment('appt-1'), createMockAppointment('appt-2')];

        (mockRepository.onNutritionistPendingChange as jest.Mock).mockImplementation((id, callback) => {
            setTimeout(() => callback(appointments), 0);
            return unsubscribeMock;
        });

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(mockRepository, mockAcceptUseCase, mockRejectUseCase, mockUserRepository, 'nutri-1')
        );

        await waitFor(() => {
            expect(result.current.pendingAppointments).toHaveLength(2);
        });

        expect(result.current.loading).toBe(false);
    });

    it('deve aceitar consulta com sucesso', async () => {
        const appointment = createMockAppointment('appt-1');
        (mockRepository.onNutritionistPendingChange as jest.Mock).mockImplementation((id, callback) => {
            callback([appointment]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.execute as jest.Mock).mockResolvedValue({ ...appointment, status: 'accepted' });

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(mockRepository, mockAcceptUseCase, mockRejectUseCase, mockUserRepository, 'nutri-1')
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        let success: boolean = false;
        await act(async () => {
            success = await result.current.acceptAppointment('appt-1');
        });

        expect(success).toBe(true);
        expect(result.current.successMessage).toBe('Consulta aceita com sucesso!');
        expect(mockAcceptUseCase.execute).toHaveBeenCalledWith('appt-1');
    });

    it('deve tratar erro ao aceitar consulta', async () => {
        (mockRepository.onNutritionistPendingChange as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.execute as jest.Mock).mockRejectedValue(new ValidationError('Já existe consulta'));

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(mockRepository, mockAcceptUseCase, mockRejectUseCase, mockUserRepository, 'nutri-1')
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
        (mockRepository.onNutritionistPendingChange as jest.Mock).mockImplementation((id, callback) => {
            callback([appointment]);
            return unsubscribeMock;
        });
        (mockRejectUseCase.execute as jest.Mock).mockResolvedValue({ ...appointment, status: 'rejected' });

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(mockRepository, mockAcceptUseCase, mockRejectUseCase, mockUserRepository, 'nutri-1')
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        let success: boolean = false;
        await act(async () => {
            success = await result.current.rejectAppointment('appt-1');
        });

        expect(success).toBe(true);
        expect(result.current.successMessage).toBe('Consulta recusada.');
        expect(mockRejectUseCase.execute).toHaveBeenCalledWith('appt-1');
    });

    it('deve tratar RepositoryError', async () => {
        (mockRepository.onNutritionistPendingChange as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.execute as jest.Mock).mockRejectedValue(new RepositoryError('Erro de conexão'));

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(mockRepository, mockAcceptUseCase, mockRejectUseCase, mockUserRepository, 'nutri-1')
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.acceptAppointment('appt-1');
        });

        expect(result.current.error).toBe('Erro de conexão');
    });

    it('deve limpar erro', async () => {
        (mockRepository.onNutritionistPendingChange as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.execute as jest.Mock).mockRejectedValue(new ValidationError('Erro'));

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(mockRepository, mockAcceptUseCase, mockRejectUseCase, mockUserRepository, 'nutri-1')
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
        (mockRepository.onNutritionistPendingChange as jest.Mock).mockImplementation((id, callback) => {
            callback([appointment]);
            return unsubscribeMock;
        });
        (mockAcceptUseCase.execute as jest.Mock).mockResolvedValue({ ...appointment, status: 'accepted' });

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(mockRepository, mockAcceptUseCase, mockRejectUseCase, mockUserRepository, 'nutri-1')
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
        (mockRepository.onNutritionistPendingChange as jest.Mock).mockImplementation((id, callback) => {
            callback([]);
            return unsubscribeMock;
        });

        const { unmount } = renderHook(() =>
            usePendingRequestsViewModel(mockRepository, mockAcceptUseCase, mockRejectUseCase, mockUserRepository, 'nutri-1')
        );

        unmount();

        expect(unsubscribeMock).toHaveBeenCalled();
    });
});
