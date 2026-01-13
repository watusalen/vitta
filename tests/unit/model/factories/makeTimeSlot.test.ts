import { makeTimeSlot } from '../../../../src/model/factories/makeTimeSlot';
import {
    AVAILABLE_TIME_SLOTS,
    AVAILABLE_WEEKDAYS,
    isWeekday,
    formatDateToISO
} from '../../../../src/model/utils/timeSlotUtils';
import TimeSlot from '../../../../src/model/entities/timeSlot';

describe('Factory makeTimeSlot', () => {
    describe('Criação Básica', () => {
        it('deve criar a TimeSlot with all required fields', () => {
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

        it('deve padronizar available como true quando não informado', () => {
            const slot = makeTimeSlot({
                date: '2025-12-17',
                timeStart: '09:00',
                timeEnd: '11:00',
            });

            expect(slot.available).toBe(true);
        });

        it('deve respeitar provided available value', () => {
            const unavailableSlot = makeTimeSlot({
                date: '2025-12-17',
                timeStart: '09:00',
                timeEnd: '11:00',
                available: false,
            });

            expect(unavailableSlot.available).toBe(false);
        });

        it('deve criar slot com available=true quando definido explicitamente', () => {
            const slot = makeTimeSlot({
                date: '2025-12-17',
                timeStart: '09:00',
                timeEnd: '11:00',
                available: true,
            });

            expect(slot.available).toBe(true);
        });
    });

    describe('Conformidade de Tipos', () => {
        it('deve retornar a valid TimeSlot interface', () => {
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

describe('Constante AVAILABLE_TIME_SLOTS', () => {
    it('deve ter 4 time slots', () => {
        expect(AVAILABLE_TIME_SLOTS).toHaveLength(4);
    });

    it('deve ter correct time ranges', () => {
        expect(AVAILABLE_TIME_SLOTS[0]).toEqual({ timeStart: '09:00', timeEnd: '11:00' });
        expect(AVAILABLE_TIME_SLOTS[1]).toEqual({ timeStart: '11:00', timeEnd: '13:00' });
        expect(AVAILABLE_TIME_SLOTS[2]).toEqual({ timeStart: '13:00', timeEnd: '15:00' });
        expect(AVAILABLE_TIME_SLOTS[3]).toEqual({ timeStart: '14:00', timeEnd: '16:00' });
    });

    it('deve cobrir 9h to 16h working hours', () => {
        const firstSlotStart = AVAILABLE_TIME_SLOTS[0].timeStart;
        const lastSlotEnd = AVAILABLE_TIME_SLOTS[AVAILABLE_TIME_SLOTS.length - 1].timeEnd;

        expect(firstSlotStart).toBe('09:00');
        expect(lastSlotEnd).toBe('16:00');
    });

    it('deve ter 2-hour duration slots', () => {
        AVAILABLE_TIME_SLOTS.forEach(slot => {
            const [startHour] = slot.timeStart.split(':').map(Number);
            const [endHour] = slot.timeEnd.split(':').map(Number);
            expect(endHour - startHour).toBe(2);
        });
    });
});

describe('AVAILABLE_WEEKDAYS Constant', () => {
    it('deve conter Monday through Friday (1-5)', () => {
        expect(AVAILABLE_WEEKDAYS).toEqual([1, 2, 3, 4, 5]);
    });

    it('deve ter 5 working days', () => {
        expect(AVAILABLE_WEEKDAYS).toHaveLength(5);
    });

    it('não deve incluir Sunday (0) or Saturday (6)', () => {
        expect(AVAILABLE_WEEKDAYS).not.toContain(0);
        expect(AVAILABLE_WEEKDAYS).not.toContain(6);
    });
});

describe('Função isWeekday', () => {
    const createLocalDate = (year: number, month: number, day: number): Date => {
        return new Date(year, month - 1, day, 12, 0, 0);
    };

    it('deve retornar true for Monday', () => {
        const monday = createLocalDate(2025, 12, 15);
        expect(monday.getDay()).toBe(1);
        expect(isWeekday(monday)).toBe(true);
    });

    it('deve retornar true for Wednesday', () => {
        const wednesday = createLocalDate(2025, 12, 17);
        expect(wednesday.getDay()).toBe(3);
        expect(isWeekday(wednesday)).toBe(true);
    });

    it('deve retornar true for Friday', () => {
        const friday = createLocalDate(2025, 12, 19);
        expect(friday.getDay()).toBe(5);
        expect(isWeekday(friday)).toBe(true);
    });

    it('deve retornar false for Saturday', () => {
        const saturday = createLocalDate(2025, 12, 20);
        expect(saturday.getDay()).toBe(6);
        expect(isWeekday(saturday)).toBe(false);
    });

    it('deve retornar false for Sunday', () => {
        const sunday = createLocalDate(2025, 12, 21);
        expect(sunday.getDay()).toBe(0);
        expect(isWeekday(sunday)).toBe(false);
    });

    it('deve corretamente identify all days of a week', () => {
        const results = [];
        for (let i = 15; i <= 21; i++) {
            const date = createLocalDate(2025, 12, i);
            results.push(isWeekday(date));
        }
        expect(results).toEqual([true, true, true, true, true, false, false]);
    });
});

describe('formatDateToISO Function', () => {
    const createLocalDate = (year: number, month: number, day: number): Date => {
        return new Date(year, month - 1, day, 12, 0, 0);
    };

    it('deve formatar date to YYYY-MM-DD', () => {
        const date = createLocalDate(2025, 12, 17);
        expect(formatDateToISO(date)).toBe('2025-12-17');
    });

    it('deve preencher single digit months with zero', () => {
        const date = createLocalDate(2025, 1, 5);
        expect(formatDateToISO(date)).toBe('2025-01-05');
    });

    it('deve preencher single digit days with zero', () => {
        const date = createLocalDate(2025, 12, 1);
        expect(formatDateToISO(date)).toBe('2025-12-01');
    });

    it('deve tratar end of year dates', () => {
        const date = createLocalDate(2025, 12, 31);
        expect(formatDateToISO(date)).toBe('2025-12-31');
    });

    it('deve tratar beginning of year dates', () => {
        const date = createLocalDate(2025, 1, 1);
        expect(formatDateToISO(date)).toBe('2025-01-01');
    });
});
