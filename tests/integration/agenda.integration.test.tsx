import { act, renderHook } from "@testing-library/react";
import { makeAppointment } from "@/model/factories/makeAppointment";
import { formatDateISO } from "@/view/utils/dateFormatters";
import ListNutritionistAgendaUseCase from "@/usecase/appointment/list/listNutritionistAgendaUseCase";
import GetUserByIdUseCase from "@/usecase/user/getUserByIdUseCase";
import useNutritionistAgendaViewModel from "@/viewmodel/nutritionist/useNutritionistAgendaViewModel";
import { InMemoryAppointmentRepository, InMemoryUserRepository, flushPromises } from "./helpers/inMemoryStores";

describe("Nutritionist agenda integration", () => {
    it("loads agenda dates and resolves patient names", async () => {
        const appointmentRepository = new InMemoryAppointmentRepository();
        const userRepository = new InMemoryUserRepository();
        const nutritionistId = "nutri-1";
        const appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() + 2);
        const appointmentDateStr = formatDateISO(appointmentDate);

        await userRepository.createUser({
            id: "patient-1",
            name: "Carlos",
            email: "carlos@example.com",
            role: "patient",
            createdAt: new Date(),
        });

        await userRepository.createUser({
            id: "patient-2",
            name: "Julia",
            email: "julia@example.com",
            role: "patient",
            createdAt: new Date(),
        });

        await appointmentRepository.create(
            makeAppointment({
                id: "appt-1",
                patientId: "patient-1",
                nutritionistId,
                date: appointmentDateStr,
                timeStart: "09:00",
                timeEnd: "11:00",
                status: "accepted",
            })
        );

        await appointmentRepository.create(
            makeAppointment({
                id: "appt-2",
                patientId: "patient-2",
                nutritionistId,
                date: appointmentDateStr,
                timeStart: "13:00",
                timeEnd: "15:00",
                status: "accepted",
            })
        );

        const listAgenda = new ListNutritionistAgendaUseCase(appointmentRepository);
        const getUserById = new GetUserByIdUseCase(userRepository);

        const { result } = renderHook(() =>
            useNutritionistAgendaViewModel(listAgenda, getUserById, nutritionistId)
        );

        await act(async () => {
            await flushPromises();
        });

        expect(result.current.markedDates.has(appointmentDateStr)).toBe(true);

        await act(async () => {
            await result.current.selectDate(appointmentDate);
        });

        expect(result.current.selectedDateAppointments).toHaveLength(2);
        expect(result.current.selectedDateAppointments[0].patientName).toBe("Carlos");
        expect(result.current.selectedDateAppointments[1].patientName).toBe("Julia");
    });
});
