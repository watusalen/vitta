import { 
    makeTimeSlot, 
    AVAILABLE_TIME_SLOTS, 
    AVAILABLE_WEEKDAYS,
    isWeekday,
    formatDateToISO 
} from '../../../../src/model/factories/makeTimeSlot';
import TimeSlot from '../../../../src/model/entities/timeSlot';

describe('makeTimeSlot Factory', () => {
    describe('Basic Creation', () => {
        it('should create a TimeSlot with all required fields', () => {
            const slot = makeTimeSlot({
                date: '2025-12-17',
                timeStart: '09:00',
                timeEnd: '11:00',
            });

            expect(slot.date).toBe('2025-12-17');
            expect(slot.timeStart).toBe('09:00');
            expect(slot.timeEnd).toBe('11:00');
            expect(slot.available).toBe(true);
        });

        it('should default available to true when not provided', () => {
            const slot = makeTimeSlot({
                date: '2025-12-17',
                timeStart: '09:00',
                timeEnd: '11:00',
            });

            expect(slot.available).toBe(true);
        });

        it('should respect provided available value', () => {
            const unavailableSlot = makeTimeSlot({
                date: '2025-12-17',
                timeStart: '09:00',
                timeEnd: '11:00',
                available: false,
            });

            expect(unavailableSlot.available).toBe(false);
        });

        it('should create slot with available=true when explicitly set', () => {
            const slot = makeTimeSlot({
                date: '2025-12-17',
                timeStart: '09:00',
                timeEnd: '11:00',
                available: true,
            });

            expect(slot.available).toBe(true);
        });
    });

    describe('Type Compliance', () => {
        it('should return a valid TimeSlot interface', () => {
            const slot: TimeSlot = makeTimeSlot({
                date: '2025-12-17',
                timeStart: '09:00',
                timeEnd: '11:00',
            });

            expect(slot).toHaveProperty('date');
            expect(slot).toHaveProperty('timeStart');
            expect(slot).toHaveProperty('timeEnd');
            expect(slot).toHaveProperty('available');
        });
    });
});

describe('AVAILABLE_TIME_SLOTS Constant', () => {
    it('should have 4 time slots', () => {
        expect(AVAILABLE_TIME_SLOTS).toHaveLength(4);
    });

    it('should have correct time ranges', () => {
        expect(AVAILABLE_TIME_SLOTS[0]).toEqual({ timeStart: '09:00', timeEnd: '11:00' });
        expect(AVAILABLE_TIME_SLOTS[1]).toEqual({ timeStart: '11:00', timeEnd: '13:00' });
        expect(AVAILABLE_TIME_SLOTS[2]).toEqual({ timeStart: '13:00', timeEnd: '15:00' });
        expect(AVAILABLE_TIME_SLOTS[3]).toEqual({ timeStart: '14:00', timeEnd: '16:00' });
    });

    it('should cover 9h to 16h working hours', () => {
        const firstSlotStart = AVAILABLE_TIME_SLOTS[0].timeStart;
        const lastSlotEnd = AVAILABLE_TIME_SLOTS[AVAILABLE_TIME_SLOTS.length - 1].timeEnd;

        expect(firstSlotStart).toBe('09:00');
        expect(lastSlotEnd).toBe('16:00');
    });

    it('should have 2-hour duration slots', () => {
        AVAILABLE_TIME_SLOTS.forEach(slot => {
            const [startHour] = slot.timeStart.split(':').map(Number);
            const [endHour] = slot.timeEnd.split(':').map(Number);
            expect(endHour - startHour).toBe(2);
        });
    });
});

describe('AVAILABLE_WEEKDAYS Constant', () => {
    it('should contain Monday through Friday (1-5)', () => {
        expect(AVAILABLE_WEEKDAYS).toEqual([1, 2, 3, 4, 5]);
    });

    it('should have 5 working days', () => {
        expect(AVAILABLE_WEEKDAYS).toHaveLength(5);
    });

    it('should not include Sunday (0) or Saturday (6)', () => {
        expect(AVAILABLE_WEEKDAYS).not.toContain(0);
        expect(AVAILABLE_WEEKDAYS).not.toContain(6);
    });
});

describe('isWeekday Function', () => {
    // Helper para criar datas no fuso local sem problemas de timezone
    const createLocalDate = (year: number, month: number, day: number): Date => {
        return new Date(year, month - 1, day, 12, 0, 0); // meio-dia para evitar edge cases
    };

    it('should return true for Monday', () => {
        // 2025-12-15 is Monday
        const monday = createLocalDate(2025, 12, 15);
        expect(monday.getDay()).toBe(1); // Validar que é segunda
        expect(isWeekday(monday)).toBe(true);
    });

    it('should return true for Wednesday', () => {
        // 2025-12-17 is Wednesday
        const wednesday = createLocalDate(2025, 12, 17);
        expect(wednesday.getDay()).toBe(3); // Validar que é quarta
        expect(isWeekday(wednesday)).toBe(true);
    });

    it('should return true for Friday', () => {
        // 2025-12-19 is Friday
        const friday = createLocalDate(2025, 12, 19);
        expect(friday.getDay()).toBe(5); // Validar que é sexta
        expect(isWeekday(friday)).toBe(true);
    });

    it('should return false for Saturday', () => {
        // 2025-12-20 is Saturday
        const saturday = createLocalDate(2025, 12, 20);
        expect(saturday.getDay()).toBe(6); // Validar que é sábado
        expect(isWeekday(saturday)).toBe(false);
    });

    it('should return false for Sunday', () => {
        // 2025-12-21 is Sunday
        const sunday = createLocalDate(2025, 12, 21);
        expect(sunday.getDay()).toBe(0); // Validar que é domingo
        expect(isWeekday(sunday)).toBe(false);
    });

    it('should correctly identify all days of a week', () => {
        const results = [];
        for (let i = 15; i <= 21; i++) {
            const date = createLocalDate(2025, 12, i);
            results.push(isWeekday(date));
        }
        // Mon, Tue, Wed, Thu, Fri, Sat, Sun
        expect(results).toEqual([true, true, true, true, true, false, false]);
    });
});

describe('formatDateToISO Function', () => {
    // Helper para criar datas no fuso local
    const createLocalDate = (year: number, month: number, day: number): Date => {
        return new Date(year, month - 1, day, 12, 0, 0);
    };

    it('should format date to YYYY-MM-DD', () => {
        const date = createLocalDate(2025, 12, 17);
        expect(formatDateToISO(date)).toBe('2025-12-17');
    });

    it('should pad single digit months with zero', () => {
        const date = createLocalDate(2025, 1, 5);
        expect(formatDateToISO(date)).toBe('2025-01-05');
    });

    it('should pad single digit days with zero', () => {
        const date = createLocalDate(2025, 12, 1);
        expect(formatDateToISO(date)).toBe('2025-12-01');
    });

    it('should handle end of year dates', () => {
        const date = createLocalDate(2025, 12, 31);
        expect(formatDateToISO(date)).toBe('2025-12-31');
    });

    it('should handle beginning of year dates', () => {
        const date = createLocalDate(2025, 1, 1);
        expect(formatDateToISO(date)).toBe('2025-01-01');
    });
});
