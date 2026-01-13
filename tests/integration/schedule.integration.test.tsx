import { act, renderHook } from "@testing-library/react";
import { formatDateISO } from "@/view/utils/dateFormatters";
import { makeAppointment } from "@/model/factories/makeAppointment";
import getAvailableTimeSlotsUseCase from "@/usecase/appointment/availability/getAvailableTimeSlotsUseCase";
import requestAppointmentUseCase from "@/usecase/appointment/request/requestAppointmentUseCase";
import getNutritionistUseCase from "@/usecase/user/getNutritionistUseCase";
import useScheduleViewModel from "@/viewmodel/appointment/useScheduleViewModel";
import { InMemoryAppointmentRepository, InMemoryUserRepository } from "./helpers/inMemoryStores";
import { IAppointmentPushNotificationUseCase } from "@/usecase/notifications/iAppointmentPushNotificationUseCase";

describe("Integração de agendamento", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2025, 0, 20, 10, 30, 0));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("carrega disponibilidade, oculta horários passados e bloqueia horários solicitados", async () => {
        const appointmentRepository = new InMemoryAppointmentRepository();
        const userRepository = new InMemoryUserRepository();
        const nutritionistId = "nutri-1";
        const patientId = "patient-1";

        await userRepository.createUser({
            id: nutritionistId,
            name: "Nutri",
            email: "nutri@example.com",
            role: "nutritionist",
            createdAt: new Date(),
        });

        const acceptedAppointment = makeAppointment({
            id: "appt-accepted",
            patientId: "patient-2",
            nutritionistId,
            date: "2025-01-20",
            timeStart: "11:00",
            timeEnd: "13:00",
            status: "accepted",
        });

        await appointmentRepository.create(acceptedAppointment);

        const getAvailableSlots = new getAvailableTimeSlotsUseCase(appointmentRepository);
        const requestAppointment = new requestAppointmentUseCase(appointmentRepository);
        const getNutritionist = new getNutritionistUseCase(userRepository);
        const appointmentPushNotification: IAppointmentPushNotificationUseCase = {
            notify: jest.fn(),
        };

        const { result } = renderHook(() =>
            useScheduleViewModel(
                getAvailableSlots,
                requestAppointment,
                appointmentPushNotification,
                getNutritionist
            )
        );

        await act(async () => {
            await result.current.loadMonthAvailability(2025, 1, nutritionistId, patientId);
        });

        const weekendDate = formatDateISO(new Date(2025, 0, 25));
        expect(result.current.availabilityMap.get(weekendDate)).toBe(false);

        await act(async () => {
            await result.current.selectDate(new Date(2025, 0, 20), nutritionistId, patientId);
        });

        const slotKeys = result.current.availableSlots.map(
            (slot) => `${slot.timeStart}-${slot.timeEnd}`
        );
        expect(slotKeys).not.toContain("09:00-11:00");
        expect(slotKeys).not.toContain("11:00-13:00");
        expect(slotKeys).toEqual(expect.arrayContaining(["13:00-15:00", "14:00-16:00"]));

        await act(async () => {
            result.current.selectSlot(result.current.availableSlots[0]);
        });

        await act(async () => {
            await result.current.requestAppointment(patientId, nutritionistId);
        });

        await act(async () => {
            await result.current.selectDate(new Date(2025, 0, 20), nutritionistId, patientId);
        });

        const refreshedSlotKeys = result.current.availableSlots.map(
            (slot) => `${slot.timeStart}-${slot.timeEnd}`
        );
        expect(refreshedSlotKeys).not.toContain("13:00-15:00");
    });

    it("marca dias sem disponibilidade como indisponíveis", async () => {
        const appointmentRepository = new InMemoryAppointmentRepository();
        const nutritionistId = "nutri-1";

        const fullyBookedDate = "2025-01-21";
        const slots = [
            { timeStart: "09:00", timeEnd: "11:00" },
            { timeStart: "11:00", timeEnd: "13:00" },
            { timeStart: "13:00", timeEnd: "15:00" },
            { timeStart: "14:00", timeEnd: "16:00" },
        ];

        await Promise.all(
            slots.map((slot, index) =>
                appointmentRepository.create(
                    makeAppointment({
                        id: `appt-${index}`,
                        patientId: `patient-${index}`,
                        nutritionistId,
                        date: fullyBookedDate,
                        timeStart: slot.timeStart,
                        timeEnd: slot.timeEnd,
                        status: "accepted",
                    })
                )
            )
        );

        const getAvailableSlots = new getAvailableTimeSlotsUseCase(appointmentRepository);
        const requestAppointment = new requestAppointmentUseCase(appointmentRepository);
        const appointmentPushNotification: IAppointmentPushNotificationUseCase = {
            notify: jest.fn(),
        };

        const { result } = renderHook(() =>
            useScheduleViewModel(getAvailableSlots, requestAppointment, appointmentPushNotification)
        );

        await act(async () => {
            await result.current.loadMonthAvailability(2025, 1, nutritionistId, "patient-1");
        });

        expect(result.current.availabilityMap.get(fullyBookedDate)).toBe(false);
    });
});
