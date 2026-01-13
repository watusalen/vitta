import { act, renderHook } from "@testing-library/react";
import Appointment from "@/model/entities/appointment";
import { makeAppointment } from "@/model/factories/makeAppointment";
import { IGetAppointmentDetailsUseCase } from "@/usecase/appointment/details/iGetAppointmentDetailsUseCase";
import { IAcceptAppointmentUseCase } from "@/usecase/appointment/status/iAcceptAppointmentUseCase";
import { IRejectAppointmentUseCase } from "@/usecase/appointment/status/iRejectAppointmentUseCase";
import { ICancelAppointmentUseCase } from "@/usecase/appointment/status/iCancelAppointmentUseCase";
import { IReactivateAppointmentUseCase } from "@/usecase/appointment/status/iReactivateAppointmentUseCase";
import { IGetUserByIdUseCase } from "@/usecase/user/iGetUserByIdUseCase";
import { IAppointmentCalendarSyncUseCase } from "@/usecase/calendar/iAppointmentCalendarSyncUseCase";
import { IAppointmentPushNotificationUseCase } from "@/usecase/notifications/iAppointmentPushNotificationUseCase";
import useNutritionistAppointmentDetailsViewModel from "@/viewmodel/nutritionist/useNutritionistAppointmentDetailsViewModel";
import useAppointmentDetailsViewModel from "@/viewmodel/appointment/useAppointmentDetailsViewModel";
import { InMemoryAppointmentRepository, InMemoryUserRepository, flushPromises } from "./helpers/inMemoryStores";

describe("Integração dos detalhes da consulta", () => {
    it("permite que a nutricionista aceite e cancele consultas", async () => {
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

        const detailsUseCase: IGetAppointmentDetailsUseCase = {
            getById: jest.fn(async (id) => appointmentRepository.getById(id)),
        };
        const acceptUseCase: IAcceptAppointmentUseCase = {
            acceptAppointment: jest.fn(async (id) => {
                await appointmentRepository.updateStatus(id, "accepted");
                return appointmentRepository.getById(id) as Promise<Appointment>;
            }),
            prepareAcceptance: jest.fn(),
        } as any;
        const rejectUseCase: IRejectAppointmentUseCase = {
            rejectAppointment: jest.fn(async (id) => {
                await appointmentRepository.updateStatus(id, "rejected");
                return appointmentRepository.getById(id) as Promise<Appointment>;
            }),
            prepareRejection: jest.fn(),
        } as any;
        const cancelUseCase: ICancelAppointmentUseCase = {
            cancelAppointment: jest.fn(async (id) => {
                await appointmentRepository.updateStatus(id, "cancelled");
                return appointmentRepository.getById(id) as Promise<Appointment>;
            }),
            prepareCancel: jest.fn(),
        } as any;
        const reactivateUseCase: IReactivateAppointmentUseCase = {
            reactivate: jest.fn(async (id) => {
                await appointmentRepository.updateStatus(id, "pending");
                return appointmentRepository.getById(id) as Promise<Appointment>;
            }),
            prepareReactivate: jest.fn(),
        } as any;
        const getUserById: IGetUserByIdUseCase = {
            getById: jest.fn(async (id) => userRepository.getUserByID(id)),
        };
        const calendarSyncUseCase: jest.Mocked<IAppointmentCalendarSyncUseCase> = {
            syncAccepted: jest.fn(),
            syncCancelledOrRejected: jest.fn(),
        };
        const appointmentPushNotification: IAppointmentPushNotificationUseCase = {
            notify: jest.fn(),
        };

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                detailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserById,
                calendarSyncUseCase,
                appointmentPushNotification
            )
        );

        await act(async () => {
            await result.current.loadAppointment("appt-1");
            await flushPromises();
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

    it("permite que o paciente cancele uma consulta aceita e resolve o nome da nutricionista", async () => {
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

        const detailsUseCase: IGetAppointmentDetailsUseCase = {
            getById: jest.fn(async (id) => appointmentRepository.getById(id)),
        };
        const cancelUseCase: ICancelAppointmentUseCase = {
            cancelAppointment: jest.fn(async (id) => {
                await appointmentRepository.updateStatus(id, "cancelled");
                return appointmentRepository.getById(id) as Promise<Appointment>;
            }),
            prepareCancel: jest.fn(),
        } as any;
        const getUserById: IGetUserByIdUseCase = {
            getById: jest.fn(async (id) => userRepository.getUserByID(id)),
        };
        const appointmentPushNotification: IAppointmentPushNotificationUseCase = {
            notify: jest.fn(),
        };

        const { result } = renderHook(() =>
            useAppointmentDetailsViewModel(
                detailsUseCase,
                getUserById,
                cancelUseCase,
                appointmentPushNotification
            )
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
