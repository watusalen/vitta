import GetAppointmentDetailsUseCase from '../../../../src/usecase/appointment/getAppointmentDetailsUseCase';
import { IAppointmentRepository } from '../../../../src/model/repositories/iAppointmentRepository';
import Appointment from '../../../../src/model/entities/appointment';
import RepositoryError from '../../../../src/model/errors/repositoryError';

// Helper para criar appointment mock
const createMockAppointment = (id: string): Appointment => ({
    id,
    patientId: 'patient-1',
    nutritionistId: 'nutri-1',
    date: '2025-12-20',
    timeStart: '09:00',
    timeEnd: '11:00',
    status: 'pending',
    observations: 'Primeira consulta',
    createdAt: new Date(),
    updatedAt: new Date(),
});

// Mock do repositório
const createMockRepository = (appointment: Appointment | null = null): IAppointmentRepository => ({
    create: jest.fn(),
    getById: jest.fn().mockResolvedValue(appointment),
    listByPatient: jest.fn(),
    listByDate: jest.fn(),
    listByStatus: jest.fn(),
    listAcceptedByDateRange: jest.fn(),
    updateStatus: jest.fn(),
    onPatientAppointmentsChange: jest.fn(() => () => {}),
    onNutritionistPendingChange: jest.fn(() => () => {}),
});

describe('GetAppointmentDetailsUseCase', () => {
    describe('execute - Successful Retrieval', () => {
        it('should return appointment when found', async () => {
            const mockAppointment = createMockAppointment('appt-123');
            const mockRepo = createMockRepository(mockAppointment);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.execute('appt-123');

            expect(result).toEqual(mockAppointment);
            expect(mockRepo.getById).toHaveBeenCalledWith('appt-123');
        });

        it('should return appointment with all fields', async () => {
            const mockAppointment = createMockAppointment('appt-123');
            const mockRepo = createMockRepository(mockAppointment);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.execute('appt-123');

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('patientId');
            expect(result).toHaveProperty('nutritionistId');
            expect(result).toHaveProperty('date');
            expect(result).toHaveProperty('timeStart');
            expect(result).toHaveProperty('timeEnd');
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('observations');
            expect(result).toHaveProperty('createdAt');
            expect(result).toHaveProperty('updatedAt');
        });
    });

    describe('execute - Not Found', () => {
        it('should return null when appointment not found', async () => {
            const mockRepo = createMockRepository(null);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.execute('non-existent-id');

            expect(result).toBeNull();
        });
    });

    describe('execute - Validation', () => {
        it('should throw RepositoryError for empty id', async () => {
            const mockRepo = createMockRepository(null);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            await expect(useCase.execute('')).rejects.toThrow(RepositoryError);
            await expect(useCase.execute('')).rejects.toThrow('ID da consulta é obrigatório.');
        });

        it('should throw RepositoryError for whitespace-only id', async () => {
            const mockRepo = createMockRepository(null);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            await expect(useCase.execute('   ')).rejects.toThrow(RepositoryError);
        });
    });

    describe('execute - Different Statuses', () => {
        it('should return pending appointment', async () => {
            const mockAppointment = { ...createMockAppointment('1'), status: 'pending' as const };
            const mockRepo = createMockRepository(mockAppointment);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.execute('1');

            expect(result?.status).toBe('pending');
        });

        it('should return accepted appointment', async () => {
            const mockAppointment = { ...createMockAppointment('1'), status: 'accepted' as const };
            const mockRepo = createMockRepository(mockAppointment);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.execute('1');

            expect(result?.status).toBe('accepted');
        });

        it('should return rejected appointment', async () => {
            const mockAppointment = { ...createMockAppointment('1'), status: 'rejected' as const };
            const mockRepo = createMockRepository(mockAppointment);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.execute('1');

            expect(result?.status).toBe('rejected');
        });

        it('should return cancelled appointment', async () => {
            const mockAppointment = { ...createMockAppointment('1'), status: 'cancelled' as const };
            const mockRepo = createMockRepository(mockAppointment);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.execute('1');

            expect(result?.status).toBe('cancelled');
        });
    });
});
