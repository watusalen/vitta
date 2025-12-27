import { act, renderHook } from "@testing-library/react";
import { makeAppointment } from "@/model/factories/makeAppointment";
import GetAppointmentDetailsUseCase from "@/usecase/appointment/details/getAppointmentDetailsUseCase";
import AcceptAppointmentUseCase from "@/usecase/appointment/status/acceptAppointmentUseCase";
import RejectAppointmentUseCase from "@/usecase/appointment/status/rejectAppointmentUseCase";
import CancelAppointmentUseCase from "@/usecase/appointment/status/cancelAppointmentUseCase";
import GetUserByIdUseCase from "@/usecase/user/getUserByIdUseCase";
import useNutritionistAppointmentDetailsViewModel from "@/viewmodel/nutritionist/useNutritionistAppointmentDetailsViewModel";
import useAppointmentDetailsViewModel from "@/viewmodel/appointment/useAppointmentDetailsViewModel";
import { InMemoryAppointmentRepository, InMemoryUserRepository, flushPromises } from "./helpers/inMemoryStores";

describe("Appointment details integration", () => {
    it("allows nutritionist to accept and cancel appointments", async () => {
        const appointmentRepository = new InMemoryAppointmentRepository();
        const userRepository = new InMemoryUserRepository();

        await userRepository.createUser({
            id: "patient-1",
            name: "Lucas",
            email: "lucas@example.com",
            role: "patient",
            createdAt: new Date(),
        });

        await appointmentRepository.create(
            makeAppointment({
                id: "appt-1",
                patientId: "patient-1",
                nutritionistId: "nutri-1",
                date: "2025-04-01",
                timeStart: "09:00",
                timeEnd: "11:00",
                status: "pending",
            })
        );

        const detailsUseCase = new GetAppointmentDetailsUseCase(appointmentRepository);
        const acceptUseCase = new AcceptAppointmentUseCase(appointmentRepository);
        const rejectUseCase = new RejectAppointmentUseCase(appointmentRepository);
        const cancelUseCase = new CancelAppointmentUseCase(appointmentRepository);
        const getUserById = new GetUserByIdUseCase(userRepository);

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                detailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                getUserById
            )
        );

        await act(async () => {
            await result.current.loadAppointment("appt-1");
        });

        expect(result.current.patientName).toBe("Lucas");
        expect(result.current.canHandle).toBe(true);

        await act(async () => {
            await result.current.acceptAppointment("appt-1");
        });

        expect(result.current.appointment?.status).toBe("accepted");
        expect(result.current.canCancel).toBe(true);

        await act(async () => {
            await result.current.cancelAppointment("appt-1");
        });

        expect(result.current.appointment?.status).toBe("cancelled");
        expect(result.current.successMessage).toBe("Consulta cancelada.");
    });

    it("allows patient to cancel accepted appointment and resolves nutritionist name", async () => {
        const appointmentRepository = new InMemoryAppointmentRepository();
        const userRepository = new InMemoryUserRepository();

        await userRepository.createUser({
            id: "nutri-1",
            name: "Dra. Ana",
            email: "ana@nutri.com",
            role: "nutritionist",
            createdAt: new Date(),
        });

        await appointmentRepository.create(
            makeAppointment({
                id: "appt-2",
                patientId: "patient-1",
                nutritionistId: "nutri-1",
                date: "2025-04-02",
                timeStart: "11:00",
                timeEnd: "13:00",
                status: "accepted",
            })
        );

        const detailsUseCase = new GetAppointmentDetailsUseCase(appointmentRepository);
        const cancelUseCase = new CancelAppointmentUseCase(appointmentRepository);
        const getUserById = new GetUserByIdUseCase(userRepository);

        const { result } = renderHook(() =>
            useAppointmentDetailsViewModel(detailsUseCase, getUserById, cancelUseCase)
        );

        await act(async () => {
            await result.current.loadAppointment("appt-2");
            await flushPromises();
        });

        expect(result.current.nutritionistName).toBe("Dra. Ana");
        expect(result.current.canCancel).toBe(true);

        await act(async () => {
            await result.current.cancelAppointment("appt-2");
        });

        expect(result.current.appointment?.status).toBe("cancelled");
        expect(result.current.successMessage).toBe("Consulta cancelada.");
    });
});
