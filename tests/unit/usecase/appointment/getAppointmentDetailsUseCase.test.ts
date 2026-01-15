import GetAppointmentDetailsUseCase from '../../../../src/usecase/appointment/details/getAppointmentDetailsUseCase';
import { IAppointmentRepository } from '../../../../src/model/repositories/iAppointmentRepository';
import Appointment from '../../../../src/model/entities/appointment';
import ValidationError from '../../../../src/model/errors/validationError';

const createMockAppointment = (id: string): Appointment => ({
    id,
    patientId: 'patient-1',
    nutritionistId: 'nutri-1',
    date: '2025-12-20',
    timeStart: '09:00',
    timeEnd: '11:00',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
});

const createMockRepository = (appointment: Appointment | null = null): IAppointmentRepository => ({
    create: jest.fn(),
    getById: jest.fn().mockResolvedValue(appointment),
    listByPatient: jest.fn(),
    listByDate: jest.fn(),
    listByStatus: jest.fn(),
    listAcceptedByDateRange: jest.fn(),
    listAgendaByDateRange: jest.fn(),
    updateStatus: jest.fn(),
    updateCalendarEventIds: jest.fn(),
    onPatientAppointmentsChange: jest.fn(() => () => {}),
    onNutritionistPendingChange: jest.fn(() => () => {}),
    onNutritionistAppointmentsChange: jest.fn(() => () => {}),
});

describe('Get Appointment Details Use Case', () => {
    describe('getById - Successful Retrieval', () => {
        it('deve retornar consulta quando encontrada', async () => {
            const mockAppointment = createMockAppointment('appt-123');
            const mockRepo = createMockRepository(mockAppointment);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.getById('appt-123');

            expect(result).toEqual(mockAppointment);
            expect(mockRepo.getById).toHaveBeenCalledWith('appt-123');
        });

        it('deve retornar appointment with all fields', async () => {
            const mockAppointment = createMockAppointment('appt-123');
            const mockRepo = createMockRepository(mockAppointment);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.getById('appt-123');

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('patientId');
            expect(result).toHaveProperty('nutritionistId');
            expect(result).toHaveProperty('date');
            expect(result).toHaveProperty('timeStart');
            expect(result).toHaveProperty('timeEnd');
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('createdAt');
            expect(result).toHaveProperty('updatedAt');
        });
    });

    describe('getById - Not Found', () => {
        it('deve retornar null quando a consulta não é encontrada', async () => {
            const mockRepo = createMockRepository(null);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.getById('non-existent-id');

            expect(result).toBeNull();
        });
    });

    describe('getById - Validation', () => {
        it('deve lançar ValidationError for empty id', async () => {
            const mockRepo = createMockRepository(null);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            await expect(useCase.getById('')).rejects.toThrow(ValidationError);
            await expect(useCase.getById('')).rejects.toThrow('ID da consulta é obrigatório.');
        });

        it('deve lançar ValidationError for whitespace-only id', async () => {
            const mockRepo = createMockRepository(null);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            await expect(useCase.getById('   ')).rejects.toThrow(ValidationError);
        });
    });

    describe('getById - Different Statuses', () => {
        it('deve retornar pending appointment', async () => {
            const mockAppointment = { ...createMockAppointment('1'), status: 'pending' as const };
            const mockRepo = createMockRepository(mockAppointment);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.getById('1');

            expect(result?.status).toBe('pending');
        });

        it('deve retornar accepted appointment', async () => {
            const mockAppointment = { ...createMockAppointment('1'), status: 'accepted' as const };
            const mockRepo = createMockRepository(mockAppointment);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.getById('1');

            expect(result?.status).toBe('accepted');
        });

        it('deve retornar rejected appointment', async () => {
            const mockAppointment = { ...createMockAppointment('1'), status: 'rejected' as const };
            const mockRepo = createMockRepository(mockAppointment);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.getById('1');

            expect(result?.status).toBe('rejected');
        });

        it('deve retornar cancelled appointment', async () => {
            const mockAppointment = { ...createMockAppointment('1'), status: 'cancelled' as const };
            const mockRepo = createMockRepository(mockAppointment);
            const useCase = new GetAppointmentDetailsUseCase(mockRepo);

            const result = await useCase.getById('1');

            expect(result?.status).toBe('cancelled');
        });
    });
});
