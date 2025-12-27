import AcceptAppointmentUseCase from '@/usecase/appointment/status/acceptAppointmentUseCase';
import { IAcceptAppointmentUseCase } from '@/usecase/appointment/status/iAcceptAppointmentUseCase';
import { IAppointmentRepository } from '@/model/repositories/iAppointmentRepository';
import Appointment from '@/model/entities/appointment';
import ValidationError from '@/model/errors/validationError';

// Helper para criar appointment mock
const createMockAppointment = (
    id: string,
    date: string,
    timeStart: string,
    timeEnd: string,
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' = 'pending',
    patientId: string = 'patient-1'
): Appointment => ({
    id,
    patientId,
    nutritionistId: 'nutri-1',
    date,
    timeStart,
    timeEnd,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
});

describe('AcceptAppointmentUseCase', () => {
    let mockRepository: IAppointmentRepository;
    let useCase: IAcceptAppointmentUseCase;
    let updatedStatuses: Map<string, string>;

    beforeEach(() => {
        updatedStatuses = new Map();
        
        mockRepository = {
            create: jest.fn(),
            getById: jest.fn(),
            listByPatient: jest.fn(),
            listByDate: jest.fn(),
            listByStatus: jest.fn(),
            listAcceptedByDateRange: jest.fn(),
            updateStatus: jest.fn().mockImplementation((id, status) => {
                updatedStatuses.set(id, status);
                return Promise.resolve();
            }),
            onPatientAppointmentsChange: jest.fn(),
            onNutritionistPendingChange: jest.fn(),
        };

        useCase = new AcceptAppointmentUseCase(mockRepository);
    });

    describe('Successful Accept', () => {
        it('should accept a pending appointment', async () => {
            const appointment = createMockAppointment('appt-1', '2025-01-20', '09:00', '11:00', 'pending');
            
            (mockRepository.getById as jest.Mock)
                .mockResolvedValueOnce(appointment)
                .mockResolvedValueOnce(appointment)
                .mockResolvedValueOnce({ ...appointment, status: 'accepted' });
            (mockRepository.listByDate as jest.Mock).mockResolvedValue([appointment]);

            const result = await useCase.acceptAppointment('appt-1');

            expect(result.status).toBe('accepted');
            expect(mockRepository.updateStatus).toHaveBeenCalledWith('appt-1', 'accepted');
        });

        it('should cancel all other pending appointments for same slot', async () => {
            const mainAppointment = createMockAppointment('appt-1', '2025-01-20', '09:00', '11:00', 'pending', 'patient-1');
            const conflicting1 = createMockAppointment('appt-2', '2025-01-20', '09:00', '11:00', 'pending', 'patient-2');
            const conflicting2 = createMockAppointment('appt-3', '2025-01-20', '09:00', '11:00', 'pending', 'patient-3');
            const differentSlot = createMockAppointment('appt-4', '2025-01-20', '11:00', '13:00', 'pending', 'patient-4');

            (mockRepository.getById as jest.Mock)
                .mockResolvedValueOnce(mainAppointment)
                .mockResolvedValueOnce(mainAppointment)
                .mockResolvedValueOnce({ ...mainAppointment, status: 'accepted' });
            (mockRepository.listByDate as jest.Mock).mockResolvedValue([
                mainAppointment,
                conflicting1,
                conflicting2,
                differentSlot,
            ]);

            await useCase.acceptAppointment('appt-1');

            // Deve ter cancelado as duas conflitantes
            expect(updatedStatuses.get('appt-2')).toBe('rejected');
            expect(updatedStatuses.get('appt-3')).toBe('rejected');
            
            // Não deve ter mexido na de outro horário
            expect(updatedStatuses.has('appt-4')).toBe(false);
            
            // Deve ter aceito a principal
            expect(updatedStatuses.get('appt-1')).toBe('accepted');
        });

        it('should not cancel appointments with different time slots', async () => {
            const mainAppointment = createMockAppointment('appt-1', '2025-01-20', '09:00', '11:00', 'pending');
            const differentSlot = createMockAppointment('appt-2', '2025-01-20', '13:00', '15:00', 'pending');

            (mockRepository.getById as jest.Mock)
                .mockResolvedValueOnce(mainAppointment)
                .mockResolvedValueOnce(mainAppointment)
                .mockResolvedValueOnce({ ...mainAppointment, status: 'accepted' });
            (mockRepository.listByDate as jest.Mock).mockResolvedValue([mainAppointment, differentSlot]);

            await useCase.acceptAppointment('appt-1');

            expect(updatedStatuses.has('appt-2')).toBe(false);
        });
    });

    describe('Validation Errors', () => {
        it('should throw ValidationError if appointment not found', async () => {
            (mockRepository.getById as jest.Mock).mockResolvedValue(null);

            await expect(useCase.acceptAppointment('non-existent')).rejects.toThrow(ValidationError);
            await expect(useCase.acceptAppointment('non-existent')).rejects.toThrow('Consulta não encontrada.');
        });

        it('should throw ValidationError if appointment is not pending', async () => {
            const accepted = createMockAppointment('appt-1', '2025-01-20', '09:00', '11:00', 'accepted');
            (mockRepository.getById as jest.Mock).mockResolvedValue(accepted);

            await expect(useCase.acceptAppointment('appt-1')).rejects.toThrow(ValidationError);
            await expect(useCase.acceptAppointment('appt-1')).rejects.toThrow('Apenas consultas pendentes podem ser aceitas.');
        });

        it('should throw ValidationError if appointment is rejected', async () => {
            const rejected = createMockAppointment('appt-1', '2025-01-20', '09:00', '11:00', 'rejected');
            (mockRepository.getById as jest.Mock).mockResolvedValue(rejected);

            await expect(useCase.acceptAppointment('appt-1')).rejects.toThrow('Apenas consultas pendentes podem ser aceitas.');
        });

        it('should throw ValidationError if appointment is cancelled', async () => {
            const cancelled = createMockAppointment('appt-1', '2025-01-20', '09:00', '11:00', 'cancelled');
            (mockRepository.getById as jest.Mock).mockResolvedValue(cancelled);

            await expect(useCase.acceptAppointment('appt-1')).rejects.toThrow('Apenas consultas pendentes podem ser aceitas.');
        });

        it('should throw ValidationError if slot already has accepted appointment', async () => {
            const pending = createMockAppointment('appt-1', '2025-01-20', '09:00', '11:00', 'pending');
            const alreadyAccepted = createMockAppointment('appt-2', '2025-01-20', '09:00', '11:00', 'accepted');

            (mockRepository.getById as jest.Mock).mockResolvedValue(pending);
            (mockRepository.listByDate as jest.Mock).mockResolvedValue([pending, alreadyAccepted]);

            await expect(useCase.acceptAppointment('appt-1')).rejects.toThrow(ValidationError);
            await expect(useCase.acceptAppointment('appt-1')).rejects.toThrow('Já existe uma consulta aceita neste horário.');
        });
    });

    describe('Edge Cases', () => {
        it('should work when there are no other pending appointments', async () => {
            const appointment = createMockAppointment('appt-1', '2025-01-20', '09:00', '11:00', 'pending');

            (mockRepository.getById as jest.Mock)
                .mockResolvedValueOnce(appointment)
                .mockResolvedValueOnce(appointment)
                .mockResolvedValueOnce({ ...appointment, status: 'accepted' });
            (mockRepository.listByDate as jest.Mock).mockResolvedValue([appointment]);

            const result = await useCase.acceptAppointment('appt-1');

            expect(result.status).toBe('accepted');
            expect(mockRepository.updateStatus).toHaveBeenCalledTimes(1);
        });

        it('should ignore cancelled and rejected appointments in the same slot', async () => {
            const pending = createMockAppointment('appt-1', '2025-01-20', '09:00', '11:00', 'pending');
            const cancelled = createMockAppointment('appt-2', '2025-01-20', '09:00', '11:00', 'cancelled');
            const rejected = createMockAppointment('appt-3', '2025-01-20', '09:00', '11:00', 'rejected');

            (mockRepository.getById as jest.Mock)
                .mockResolvedValueOnce(pending)
                .mockResolvedValueOnce(pending)
                .mockResolvedValueOnce({ ...pending, status: 'accepted' });
            (mockRepository.listByDate as jest.Mock).mockResolvedValue([pending, cancelled, rejected]);

            await useCase.acceptAppointment('appt-1');

            // Só deve ter atualizado a principal
            expect(mockRepository.updateStatus).toHaveBeenCalledTimes(1);
            expect(mockRepository.updateStatus).toHaveBeenCalledWith('appt-1', 'accepted');
        });
    });
});
