import { act, renderHook } from "@testing-library/react";
import { makeAppointment } from "@/model/factories/makeAppointment";
import AcceptAppointmentUseCase from "@/usecase/appointment/status/acceptAppointmentUseCase";
import RejectAppointmentUseCase from "@/usecase/appointment/status/rejectAppointmentUseCase";
import ListPendingAppointmentsUseCase from "@/usecase/appointment/list/listPendingAppointmentsUseCase";
import GetUserByIdUseCase from "@/usecase/user/getUserByIdUseCase";
import usePendingRequestsViewModel from "@/viewmodel/nutritionist/usePendingRequestsViewModel";
import { InMemoryAppointmentRepository, InMemoryUserRepository, flushPromises } from "./helpers/inMemoryStores";

describe("Pending requests integration", () => {
    it("loads pending requests and updates after acceptance", async () => {
        const appointmentRepository = new InMemoryAppointmentRepository();
        const userRepository = new InMemoryUserRepository();
        const nutritionistId = "nutri-1";

        await userRepository.createUser({
            id: "patient-1",
            name: "Maria",
            email: "maria@example.com",
            role: "patient",
            createdAt: new Date(),
        });

        await userRepository.createUser({
            id: "patient-2",
            name: "Pedro",
            email: "pedro@example.com",
            role: "patient",
            createdAt: new Date(),
        });

        await appointmentRepository.create(
            makeAppointment({
                id: "appt-1",
                patientId: "patient-1",
                nutritionistId,
                date: "2025-03-10",
                timeStart: "09:00",
                timeEnd: "11:00",
                status: "pending",
            })
        );

        await appointmentRepository.create(
            makeAppointment({
                id: "appt-2",
                patientId: "patient-2",
                nutritionistId,
                date: "2025-03-10",
                timeStart: "11:00",
                timeEnd: "13:00",
                status: "pending",
            })
        );

        const listPending = new ListPendingAppointmentsUseCase(appointmentRepository);
        const acceptUseCase = new AcceptAppointmentUseCase(appointmentRepository);
        const rejectUseCase = new RejectAppointmentUseCase(appointmentRepository);
        const getUserById = new GetUserByIdUseCase(userRepository);

        const { result } = renderHook(() =>
            usePendingRequestsViewModel(
                listPending,
                acceptUseCase,
                rejectUseCase,
                getUserById,
                nutritionistId
            )
        );

        await act(async () => {
            await flushPromises();
        });

        expect(result.current.pendingAppointments).toHaveLength(2);
        expect(result.current.pendingAppointments[0].patientName).toBe("Maria");

        await act(async () => {
            await result.current.acceptAppointment("appt-1");
        });

        await act(async () => {
            await flushPromises();
        });

        expect(result.current.pendingAppointments).toHaveLength(1);
        expect(result.current.pendingAppointments[0].id).toBe("appt-2");
    });
});
