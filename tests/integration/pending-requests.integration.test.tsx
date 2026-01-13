import { act, renderHook } from "@testing-library/react";
import Appointment from "@/model/entities/appointment";
import { makeAppointment } from "@/model/factories/makeAppointment";
import { IAcceptAppointmentUseCase } from "@/usecase/appointment/status/iAcceptAppointmentUseCase";
import { IRejectAppointmentUseCase } from "@/usecase/appointment/status/iRejectAppointmentUseCase";
import { IListPendingAppointmentsUseCase } from "@/usecase/appointment/list/iListPendingAppointmentsUseCase";
import { IGetUserByIdUseCase } from "@/usecase/user/iGetUserByIdUseCase";
import { IAppointmentCalendarSyncUseCase } from "@/usecase/calendar/iAppointmentCalendarSyncUseCase";
import { IAppointmentPushNotificationUseCase } from "@/usecase/notifications/iAppointmentPushNotificationUseCase";
import usePendingRequestsViewModel from "@/viewmodel/nutritionist/usePendingRequestsViewModel";
import { InMemoryAppointmentRepository, InMemoryUserRepository, flushPromises } from "./helpers/inMemoryStores";

describe("Integração de solicitações pendentes", () => {
    it("carrega solicitações pendentes e atualiza após a aceitação", async () => {
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

        const listPending: IListPendingAppointmentsUseCase = {
            listPendingByNutritionist: jest
                .fn()
                .mockResolvedValue(await appointmentRepository.listByStatus("pending", nutritionistId)),
            subscribePendingByNutritionist: jest.fn((nutritionistId, callback) => {
                return appointmentRepository.onNutritionistPendingChange(nutritionistId, callback);
            }),
        } as any;
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
            usePendingRequestsViewModel(
                listPending,
                acceptUseCase,
                rejectUseCase,
                getUserById,
                calendarSyncUseCase,
                appointmentPushNotification,
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
