import RejectAppointmentUseCase from '@/usecase/appointment/status/rejectAppointmentUseCase';
import { IRejectAppointmentUseCase } from '@/usecase/appointment/status/iRejectAppointmentUseCase';
import { IAppointmentRepository } from '@/model/repositories/iAppointmentRepository';
import Appointment from '@/model/entities/appointment';
import ValidationError from '@/model/errors/validationError';

// Helper para criar appointment mock
const createMockAppointment = (
    id: string,
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' = 'pending'
): Appointment => ({
    id,
    patientId: 'patient-1',
    nutritionistId: 'nutri-1',
    date: '2025-01-20',
    timeStart: '09:00',
    timeEnd: '11:00',
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
});

describe('RejectAppointmentUseCase', () => {
    let mockRepository: IAppointmentRepository;
    let useCase: IRejectAppointmentUseCase;

    beforeEach(() => {
        mockRepository = {
            create: jest.fn(),
            getById: jest.fn(),
            listByPatient: jest.fn(),
            listByDate: jest.fn(),
            listByStatus: jest.fn(),
            listAcceptedByDateRange: jest.fn(),
            listAgendaByDateRange: jest.fn(),
            updateStatus: jest.fn(),
            updateCalendarEventIds: jest.fn(),
            onPatientAppointmentsChange: jest.fn(),
            onNutritionistPendingChange: jest.fn(),
            onNutritionistAppointmentsChange: jest.fn(),
        };

        useCase = new RejectAppointmentUseCase(mockRepository);
    });

    describe('Successful Rejection', () => {
        it('should reject a pending appointment', async () => {
            const pendingAppointment = createMockAppointment('appt-1', 'pending');
            const rejectedAppointment = { ...pendingAppointment, status: 'rejected' as const };

            (mockRepository.getById as jest.Mock)
                .mockResolvedValueOnce(pendingAppointment)
                .mockResolvedValueOnce(rejectedAppointment);

            const result = await useCase.rejectAppointment('appt-1');

            expect(result.status).toBe('rejected');
            expect(mockRepository.updateStatus).toHaveBeenCalledWith('appt-1', 'rejected');
        });

        it('should call updateStatus with correct parameters', async () => {
            const pendingAppointment = createMockAppointment('appt-123', 'pending');
            const rejectedAppointment = { ...pendingAppointment, status: 'rejected' as const };

            (mockRepository.getById as jest.Mock)
                .mockResolvedValueOnce(pendingAppointment)
                .mockResolvedValueOnce(rejectedAppointment);

            await useCase.rejectAppointment('appt-123');

            expect(mockRepository.updateStatus).toHaveBeenCalledWith('appt-123', 'rejected');
            expect(mockRepository.updateStatus).toHaveBeenCalledTimes(1);
        });
    });

    describe('Validation Errors', () => {
        it('should throw ValidationError if appointment not found', async () => {
            (mockRepository.getById as jest.Mock).mockResolvedValue(null);

            await expect(useCase.rejectAppointment('non-existent')).rejects.toThrow(ValidationError);
            await expect(useCase.rejectAppointment('non-existent')).rejects.toThrow('Consulta não encontrada.');
        });

        it('should throw ValidationError if appointment is accepted', async () => {
            const acceptedAppointment = createMockAppointment('appt-1', 'accepted');
            (mockRepository.getById as jest.Mock).mockResolvedValue(acceptedAppointment);

            await expect(useCase.rejectAppointment('appt-1')).rejects.toThrow(ValidationError);
            await expect(useCase.rejectAppointment('appt-1')).rejects.toThrow('Apenas consultas pendentes podem ser recusadas.');
        });

        it('should throw ValidationError if appointment is already rejected', async () => {
            const rejectedAppointment = createMockAppointment('appt-1', 'rejected');
            (mockRepository.getById as jest.Mock).mockResolvedValue(rejectedAppointment);

            await expect(useCase.rejectAppointment('appt-1')).rejects.toThrow('Apenas consultas pendentes podem ser recusadas.');
        });

        it('should throw ValidationError if appointment is cancelled', async () => {
            const cancelledAppointment = createMockAppointment('appt-1', 'cancelled');
            (mockRepository.getById as jest.Mock).mockResolvedValue(cancelledAppointment);

            await expect(useCase.rejectAppointment('appt-1')).rejects.toThrow('Apenas consultas pendentes podem ser recusadas.');
        });
    });
});
