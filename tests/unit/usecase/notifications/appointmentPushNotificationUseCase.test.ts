import AppointmentPushNotificationUseCase from "@/usecase/notifications/appointmentPushNotificationUseCase";
import { IUserRepository } from "@/model/repositories/iUserRepository";
import { IPushNotificationSender } from "@/model/services/iPushNotificationSender";
import Appointment from "@/model/entities/appointment";

describe("AppointmentPushNotificationUseCase", () => {
    let repository: jest.Mocked<IUserRepository>;
    let sender: jest.Mocked<IPushNotificationSender>;
    let useCase: AppointmentPushNotificationUseCase;

    const appointment: Appointment = {
        id: "appt-1",
        patientId: "patient-1",
        nutritionistId: "nutri-1",
        date: "2025-02-15",
        timeStart: "10:00",
        timeEnd: "10:30",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        repository = {
            createUser: jest.fn(),
            getUserByID: jest.fn(),
            getByRole: jest.fn(),
            addPushToken: jest.fn(),
            removePushToken: jest.fn(),
            getPushTokens: jest.fn().mockResolvedValue(["token-1"]),
        };
        sender = {
            sendPush: jest.fn(),
        };
        useCase = new AppointmentPushNotificationUseCase(repository, sender);
    });

    it("deve ignorar quando nao existir token", async () => {
        repository.getPushTokens.mockResolvedValueOnce([]);

        await useCase.notify(appointment, "requested", "nutritionist");

        expect(sender.sendPush).not.toHaveBeenCalled();
    });

    it("deve enviar notificacao para o paciente", async () => {
        repository.getUserByID.mockResolvedValue({
            id: "nutri-1",
            name: "Nutri",
            email: "n@example.com",
            role: "nutritionist",
            createdAt: new Date(),
        });

        await useCase.notify(appointment, "accepted", "patient");

        expect(sender.sendPush).toHaveBeenCalledWith(["token-1"], {
            title: "Consulta confirmada",
            body: "Sua consulta com Nutri em 15/02/2025 às 10:00 foi confirmada.",
            data: {
                url: "/appointment/appt-1",
                appointmentId: "appt-1",
                status: "accepted",
            },
        });
    });

    it("deve enviar notificacao para a nutricionista", async () => {
        repository.getUserByID.mockResolvedValue({
            id: "patient-1",
            name: "Paciente",
            email: "p@example.com",
            role: "patient",
            createdAt: new Date(),
        });

        await useCase.notify(appointment, "requested", "nutritionist");

        expect(sender.sendPush).toHaveBeenCalledWith(["token-1"], {
            title: "Nova solicitação de consulta",
            body: "Paciente solicitou uma consulta para 15/02/2025 às 10:00.",
            data: {
                url: "/nutritionist-appointment/appt-1",
                appointmentId: "appt-1",
                status: "requested",
            },
        });
    });

    it("deve indicar quem cancelou a consulta para a nutricionista", async () => {
        repository.getUserByID.mockImplementation(async (id: string) => {
            if (id === "patient-1") {
                return {
                    id: "patient-1",
                    name: "Jesseane",
                    email: "j@example.com",
                    role: "patient",
                    createdAt: new Date(),
                };
            }
            if (id === "nutri-1") {
                return {
                    id: "nutri-1",
                    name: "Ana",
                    email: "a@example.com",
                    role: "nutritionist",
                    createdAt: new Date(),
                };
            }
            return null;
        });

        await useCase.notify(appointment, "cancelled", "nutritionist");

        expect(sender.sendPush).toHaveBeenCalledWith(["token-1"], {
            title: "Consulta cancelada",
            body: "Paciente Jesseane cancelou a consulta em 15/02/2025 às 10:00.",
            data: {
                url: "/nutritionist-appointment/appt-1",
                appointmentId: "appt-1",
                status: "cancelled",
            },
        });
    });
});
