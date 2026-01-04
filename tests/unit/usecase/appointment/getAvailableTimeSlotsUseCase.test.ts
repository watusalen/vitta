import GetAvailableTimeSlotsUseCase from '../../../../src/usecase/appointment/availability/getAvailableTimeSlotsUseCase';
import { IAppointmentRepository } from '../../../../src/model/repositories/iAppointmentRepository';
import Appointment from '../../../../src/model/entities/appointment';
import TimeSlot from '../../../../src/model/entities/timeSlot';

// Mock do repositório
const createMockRepository = (acceptedAppointments: Appointment[] = []): jest.Mocked<IAppointmentRepository> => ({
    create: jest.fn(),
    getById: jest.fn(),
    listByPatient: jest.fn(),
    listByDate: jest.fn().mockResolvedValue(acceptedAppointments),
    listByStatus: jest.fn(),
    listAcceptedByDateRange: jest.fn().mockResolvedValue(acceptedAppointments),
    listAgendaByDateRange: jest.fn(),
    updateStatus: jest.fn(),
    updateCalendarEventIds: jest.fn(),
    onPatientAppointmentsChange: jest.fn((_: string, __: (appointments: Appointment[]) => void) => () => {}),
    onNutritionistPendingChange: jest.fn((_: string, __: (appointments: Appointment[]) => void) => () => {}),
    onNutritionistAppointmentsChange: jest.fn((_: string, __: (appointments: Appointment[]) => void) => () => {}),
});

// Helper para criar datas locais
const createLocalDate = (year: number, month: number, day: number): Date => {
    return new Date(year, month - 1, day, 12, 0, 0);
};

// Helper para criar appointment mock
const createMockAppointment = (
    date: string,
    timeStart: string,
    timeEnd: string,
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' = 'accepted'
): Appointment => ({
    id: `appt-${Date.now()}`,
    patientId: 'patient-1',
    nutritionistId: 'nutri-1',
    date,
    timeStart,
    timeEnd,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
});

describe('GetAvailableTimeSlotsUseCase', () => {
    const nutritionistId = 'nutri-1';

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-12-01T09:00:00Z'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe('execute - Basic Functionality', () => {
        it('should return all 4 slots for a weekday with no appointments', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            // Wednesday 2025-12-17
            const wednesday = createLocalDate(2025, 12, 17);
            const slots = await useCase.listAvailableSlots(wednesday, nutritionistId);

            expect(slots).toHaveLength(4);
            expect(slots[0].timeStart).toBe('09:00');
            expect(slots[1].timeStart).toBe('11:00');
            expect(slots[2].timeStart).toBe('13:00');
            expect(slots[3].timeStart).toBe('14:00');
        });

        it('should return empty array for Saturday', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            // Saturday 2025-12-20
            const saturday = createLocalDate(2025, 12, 20);
            const slots = await useCase.listAvailableSlots(saturday, nutritionistId);

            expect(slots).toHaveLength(0);
        });

        it('should return empty array for Sunday', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            // Sunday 2025-12-21
            const sunday = createLocalDate(2025, 12, 21);
            const slots = await useCase.listAvailableSlots(sunday, nutritionistId);

            expect(slots).toHaveLength(0);
        });

        it('should mark all slots as available=true', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            const wednesday = createLocalDate(2025, 12, 17);
            const slots = await useCase.listAvailableSlots(wednesday, nutritionistId);

            slots.forEach((slot: TimeSlot) => {
                expect(slot.available).toBe(true);
            });
        });

        it('should set correct date on all slots', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            const wednesday = createLocalDate(2025, 12, 17);
            const slots = await useCase.listAvailableSlots(wednesday, nutritionistId);

            slots.forEach((slot: TimeSlot) => {
                expect(slot.date).toBe('2025-12-17');
            });
        });
    });

    describe('execute - Filtering Occupied Slots', () => {
        it('should exclude slot with accepted appointment', async () => {
            const acceptedAppointments = [
                createMockAppointment('2025-12-17', '09:00', '11:00', 'accepted'),
            ];
            const mockRepo = createMockRepository(acceptedAppointments);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            const wednesday = createLocalDate(2025, 12, 17);
            const slots = await useCase.listAvailableSlots(wednesday, nutritionistId);

            expect(slots).toHaveLength(3);
            expect(slots.find(s => s.timeStart === '09:00')).toBeUndefined();
        });

        it('should exclude slot with pending appointment for the same patient', async () => {
            const mockRepo = createMockRepository([]);
            mockRepo.listByPatient.mockResolvedValueOnce([
                createMockAppointment('2025-12-17', '11:00', '13:00', 'pending'),
            ]);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            const wednesday = createLocalDate(2025, 12, 17);
            const slots = await useCase.listAvailableSlots(wednesday, nutritionistId, 'patient-1');

            expect(slots).toHaveLength(3);
            expect(slots.find(s => s.timeStart === '11:00')).toBeUndefined();
        });

        it('should not exclude slot with pending appointment', async () => {
            const pendingAppointments = [
                createMockAppointment('2025-12-17', '09:00', '11:00', 'pending'),
            ];
            const mockRepo = createMockRepository(pendingAppointments);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            const wednesday = createLocalDate(2025, 12, 17);
            const slots = await useCase.listAvailableSlots(wednesday, nutritionistId);

            // Pending não bloqueia o slot
            expect(slots).toHaveLength(4);
        });

        it('should not exclude slot with rejected appointment', async () => {
            const rejectedAppointments = [
                createMockAppointment('2025-12-17', '09:00', '11:00', 'rejected'),
            ];
            const mockRepo = createMockRepository(rejectedAppointments);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            const wednesday = createLocalDate(2025, 12, 17);
            const slots = await useCase.listAvailableSlots(wednesday, nutritionistId);

            expect(slots).toHaveLength(4);
        });

        it('should not exclude slot with cancelled appointment', async () => {
            const cancelledAppointments = [
                createMockAppointment('2025-12-17', '09:00', '11:00', 'cancelled'),
            ];
            const mockRepo = createMockRepository(cancelledAppointments);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            const wednesday = createLocalDate(2025, 12, 17);
            const slots = await useCase.listAvailableSlots(wednesday, nutritionistId);

            expect(slots).toHaveLength(4);
        });

        it('should exclude multiple slots with accepted appointments', async () => {
            const acceptedAppointments = [
                createMockAppointment('2025-12-17', '09:00', '11:00', 'accepted'),
                createMockAppointment('2025-12-17', '13:00', '15:00', 'accepted'),
            ];
            const mockRepo = createMockRepository(acceptedAppointments);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            const wednesday = createLocalDate(2025, 12, 17);
            const slots = await useCase.listAvailableSlots(wednesday, nutritionistId);

            expect(slots).toHaveLength(2);
            expect(slots.find(s => s.timeStart === '09:00')).toBeUndefined();
            expect(slots.find(s => s.timeStart === '13:00')).toBeUndefined();
            expect(slots.find(s => s.timeStart === '11:00')).toBeDefined();
            expect(slots.find(s => s.timeStart === '14:00')).toBeDefined();
        });

        it('should return empty when all slots are occupied', async () => {
            const acceptedAppointments = [
                createMockAppointment('2025-12-17', '09:00', '11:00', 'accepted'),
                createMockAppointment('2025-12-17', '11:00', '13:00', 'accepted'),
                createMockAppointment('2025-12-17', '13:00', '15:00', 'accepted'),
                createMockAppointment('2025-12-17', '14:00', '16:00', 'accepted'),
            ];
            const mockRepo = createMockRepository(acceptedAppointments);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            const wednesday = createLocalDate(2025, 12, 17);
            const slots = await useCase.listAvailableSlots(wednesday, nutritionistId);

            expect(slots).toHaveLength(0);
        });
    });

    describe('hasAvailability', () => {
        it('should return true when there are available slots', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            const wednesday = createLocalDate(2025, 12, 17);
            const hasAvailability = await useCase.hasAvailabilityOnDate(wednesday, nutritionistId);

            expect(hasAvailability).toBe(true);
        });

        it('should return false for weekend', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            const saturday = createLocalDate(2025, 12, 20);
            const hasAvailability = await useCase.hasAvailabilityOnDate(saturday, nutritionistId);

            expect(hasAvailability).toBe(false);
        });

        it('should return false when all slots are occupied', async () => {
            const acceptedAppointments = [
                createMockAppointment('2025-12-17', '09:00', '11:00', 'accepted'),
                createMockAppointment('2025-12-17', '11:00', '13:00', 'accepted'),
                createMockAppointment('2025-12-17', '13:00', '15:00', 'accepted'),
                createMockAppointment('2025-12-17', '14:00', '16:00', 'accepted'),
            ];
            const mockRepo = createMockRepository(acceptedAppointments);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            const wednesday = createLocalDate(2025, 12, 17);
            const hasAvailability = await useCase.hasAvailabilityOnDate(wednesday, nutritionistId);

            expect(hasAvailability).toBe(false);
        });
    });

    describe('executeForRange', () => {
        it('should return slots for each weekday in range', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            // Mon 15 to Fri 19
            const startDate = createLocalDate(2025, 12, 15);
            const endDate = createLocalDate(2025, 12, 19);
            
            const result = await useCase.listAvailableSlotsForRange(startDate, endDate, nutritionistId);

            expect(result.size).toBe(5);
            expect(result.has('2025-12-15')).toBe(true);
            expect(result.has('2025-12-16')).toBe(true);
            expect(result.has('2025-12-17')).toBe(true);
            expect(result.has('2025-12-18')).toBe(true);
            expect(result.has('2025-12-19')).toBe(true);
        });

        it('should exclude weekends from range', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            // Fri 19 to Mon 22 (includes Sat 20, Sun 21)
            const startDate = createLocalDate(2025, 12, 19);
            const endDate = createLocalDate(2025, 12, 22);
            
            const result = await useCase.listAvailableSlotsForRange(startDate, endDate, nutritionistId);

            expect(result.has('2025-12-19')).toBe(true);
            expect(result.has('2025-12-20')).toBe(false); // Saturday
            expect(result.has('2025-12-21')).toBe(false); // Sunday
            expect(result.has('2025-12-22')).toBe(true);
        });
    });

    describe('execute - Past slots', () => {
        it('should exclude slots earlier than current time for today', async () => {
            jest.setSystemTime(new Date(2025, 11, 17, 12, 30, 0));
            const mockRepo = createMockRepository([]);
            const useCase = new GetAvailableTimeSlotsUseCase(mockRepo);

            const wednesday = createLocalDate(2025, 12, 17);
            const slots = await useCase.listAvailableSlots(wednesday, nutritionistId);

            expect(slots.find(s => s.timeStart === '09:00')).toBeUndefined();
            expect(slots.find(s => s.timeStart === '11:00')).toBeUndefined();
            expect(slots.find(s => s.timeStart === '13:00')).toBeDefined();
        });
    });
});
