import { renderHook, act } from "@testing-library/react";
import useNutritionistAppointmentDetailsViewModel from "@/viewmodel/nutritionist/useNutritionistAppointmentDetailsViewModel";
import RepositoryError from "@/model/errors/repositoryError";
import ValidationError from "@/model/errors/validationError";
import Appointment from "@/model/entities/appointment";
import { IGetAppointmentDetailsUseCase } from "@/usecase/appointment/details/iGetAppointmentDetailsUseCase";
import { IAcceptAppointmentUseCase } from "@/usecase/appointment/status/iAcceptAppointmentUseCase";
import { IRejectAppointmentUseCase } from "@/usecase/appointment/status/iRejectAppointmentUseCase";
import { ICancelAppointmentUseCase } from "@/usecase/appointment/status/iCancelAppointmentUseCase";
import { IReactivateAppointmentUseCase } from "@/usecase/appointment/status/iReactivateAppointmentUseCase";
import { IGetUserByIdUseCase } from "@/usecase/user/iGetUserByIdUseCase";
import { IAppointmentCalendarSyncUseCase } from "@/usecase/calendar/iAppointmentCalendarSyncUseCase";
import { IAppointmentPushNotificationUseCase } from "@/usecase/notifications/iAppointmentPushNotificationUseCase";

const baseAppointment: Appointment = {
    id: "appt-1",
    patientId: "patient-1",
    nutritionistId: "nutri-1",
    date: "2025-12-17",
    timeStart: "09:00",
    timeEnd: "11:00",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe("ViewModel de Detalhes da Consulta - Nutricionista", () => {
    let getDetailsUseCase: jest.Mocked<IGetAppointmentDetailsUseCase>;
    let acceptUseCase: jest.Mocked<IAcceptAppointmentUseCase>;
    let rejectUseCase: jest.Mocked<IRejectAppointmentUseCase>;
    let cancelUseCase: jest.Mocked<ICancelAppointmentUseCase>;
    let reactivateUseCase: jest.Mocked<IReactivateAppointmentUseCase>;
    let getUserByIdUseCase: jest.Mocked<IGetUserByIdUseCase>;
    let calendarSyncUseCase: jest.Mocked<IAppointmentCalendarSyncUseCase>;
    let appointmentPushNotificationUseCase: jest.Mocked<IAppointmentPushNotificationUseCase>;

    beforeEach(() => {
        getDetailsUseCase = { getById: jest.fn() };
        acceptUseCase = { acceptAppointment: jest.fn(), prepareAcceptance: jest.fn() };
        rejectUseCase = { rejectAppointment: jest.fn(), prepareRejection: jest.fn() };
        cancelUseCase = { cancelAppointment: jest.fn(), prepareCancel: jest.fn() };
        reactivateUseCase = { reactivateAppointment: jest.fn() };
        getUserByIdUseCase = { getById: jest.fn() };
        calendarSyncUseCase = { syncAccepted: jest.fn(), syncCancelledOrRejected: jest.fn() };
        appointmentPushNotificationUseCase = { notify: jest.fn() };
    });

    it("deve marcar notFound quando consulta não existe", async () => {
        getDetailsUseCase.getById.mockResolvedValueOnce(null);

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.loadAppointment("appt-1");
        });

        expect(result.current.notFound).toBe(true);
        expect(result.current.appointment).toBeNull();
    });

    it("deve carregar consulta e paciente", async () => {
        getDetailsUseCase.getById.mockResolvedValueOnce(baseAppointment);
        getUserByIdUseCase.getById.mockResolvedValueOnce({
            id: "patient-1",
            name: "João",
            email: "joao@email.com",
            role: "patient",
            createdAt: new Date(),
        });

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.loadAppointment("appt-1");
        });

        expect(result.current.appointment?.id).toBe("appt-1");
        expect(result.current.patientName).toBe("João");
        expect(result.current.canHandle).toBe(true);
    });

    it("deve usar fallback quando paciente não pode ser carregado", async () => {
        getDetailsUseCase.getById.mockResolvedValueOnce(baseAppointment);
        getUserByIdUseCase.getById.mockRejectedValueOnce(new Error("erro"));

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.loadAppointment("appt-1");
        });

        expect(result.current.patientName).toBe("Paciente");
    });

    it("deve tratar erro ao carregar consulta", async () => {
        getDetailsUseCase.getById.mockRejectedValueOnce(new RepositoryError("Falha"));

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.loadAppointment("appt-1");
        });

        expect(result.current.error).toBe("Falha");
    });

    it("deve aceitar consulta com sucesso", async () => {
        const accepted = { ...baseAppointment, status: "accepted" as const };
        acceptUseCase.acceptAppointment.mockResolvedValueOnce(accepted);

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.acceptAppointment("appt-1");
        });

        expect(result.current.appointment?.status).toBe("accepted");
        expect(result.current.successMessage).toBe("Consulta aceita com sucesso!");
    });

    it("deve tratar erro de validação ao aceitar", async () => {
        acceptUseCase.acceptAppointment.mockRejectedValueOnce(new ValidationError("Conflito"));

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.acceptAppointment("appt-1");
        });

        expect(result.current.error).toBe("Conflito");
    });

    it("deve tratar erro de repositório ao recusar", async () => {
        rejectUseCase.rejectAppointment.mockRejectedValueOnce(new RepositoryError("Erro ao recusar"));

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.rejectAppointment("appt-1");
        });

        expect(result.current.error).toBe("Erro ao recusar");
    });

    it("deve tratar erro desconhecido ao cancelar", async () => {
        cancelUseCase.cancelAppointment.mockRejectedValueOnce(new Error("unknown"));

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.cancelAppointment("appt-1");
        });

        expect(result.current.error).toBe("Erro ao cancelar consulta.");
    });

    it("deve limpar mensagens", async () => {
        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        act(() => {
            result.current.clearError();
            result.current.clearSuccess();
        });

        expect(result.current.error).toBeNull();
        expect(result.current.successMessage).toBeNull();
    });

    it("deve ignorar chamada de loadAppointment com appointmentId vazio", async () => {
        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.loadAppointment("");
        });

        expect(getDetailsUseCase.getById).not.toHaveBeenCalled();
    });

    it("deve limpar conflictMessage e conflictAlertOpen no loadAppointment", async () => {
        const appointment = { ...baseAppointment };
        getDetailsUseCase.getById.mockResolvedValueOnce(appointment);

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.loadAppointment("appt-1");
        });

        expect(result.current.conflictAlertOpen).toBe(false);
        expect(result.current.conflictMessage).toBeNull();
    });

    it("deve tratar ValidationError ao aceitar consulta", async () => {
        acceptUseCase.acceptAppointment.mockRejectedValueOnce(
            new ValidationError("Status inválido para aceitar")
        );

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.acceptAppointment("appt-1");
        });

        expect(result.current.error).toBe("Status inválido para aceitar");
        expect(result.current.processing).toBe(false);
    });

    it("deve tratar RepositoryError ao aceitar consulta", async () => {
        acceptUseCase.acceptAppointment.mockRejectedValueOnce(
            new RepositoryError("Erro ao atualizar banco de dados")
        );

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.acceptAppointment("appt-1");
        });

        expect(result.current.error).toBe("Erro ao atualizar banco de dados");
    });

    it("deve tratar erro genérico ao aceitar consulta", async () => {
        acceptUseCase.acceptAppointment.mockRejectedValueOnce(new Error("Unknown error"));

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.acceptAppointment("appt-1");
        });

        expect(result.current.error).toBe("Erro ao aceitar consulta.");
    });

    it("deve tratar ValidationError ao rejeitar consulta", async () => {
        rejectUseCase.rejectAppointment.mockRejectedValueOnce(
            new ValidationError("Não pode rejeitar esta consulta")
        );

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.rejectAppointment("appt-1");
        });

        expect(result.current.error).toBe("Não pode rejeitar esta consulta");
    });

    it("deve tratar erro genérico ao rejeitar consulta", async () => {
        rejectUseCase.rejectAppointment.mockRejectedValueOnce(new Error("Unknown error"));

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.rejectAppointment("appt-1");
        });

        expect(result.current.error).toBe("Erro ao recusar consulta.");
    });

    it("deve tratar erro genérico ao cancelar consulta", async () => {
        cancelUseCase.cancelAppointment.mockRejectedValueOnce(new Error("Unknown error"));

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.cancelAppointment("appt-1");
        });

        expect(result.current.error).toBe("Erro ao cancelar consulta.");
    });

    it("deve tratar erro genérico ao reativar consulta", async () => {
        reactivateUseCase.reactivateAppointment.mockRejectedValueOnce(new Error("Unknown error"));

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.reactivateAppointment("appt-1");
        });

        expect(result.current.error).toBe("Erro ao reativar consulta.");
    });

    it("deve detectar conflito quando ValidationError contém 'conflito'", async () => {
        reactivateUseCase.reactivateAppointment.mockRejectedValueOnce(
            new ValidationError("Conflito de horário")
        );

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.reactivateAppointment("appt-1");
        });

        expect(result.current.conflictAlertOpen).toBe(true);
        expect(result.current.conflictMessage).toContain("horário");
    });

    it("deve limpar condicoes ao aceitar quando há erro anterior", async () => {
        acceptUseCase.acceptAppointment.mockRejectedValueOnce(new Error("First error"));

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.acceptAppointment("appt-1");
        });

        expect(result.current.error).toBe("Erro ao aceitar consulta.");

        const acceptedAppointment = { ...baseAppointment, status: "accepted" as const };
        acceptUseCase.acceptAppointment.mockResolvedValueOnce(acceptedAppointment);
        (calendarSyncUseCase.syncAccepted as jest.Mock).mockResolvedValue(undefined);
        (appointmentPushNotificationUseCase.notify as jest.Mock).mockResolvedValue(undefined);

        await act(async () => {
            await result.current.acceptAppointment("appt-1");
        });

        expect(result.current.error).toBeNull();
        expect(result.current.successMessage).toBe("Consulta aceita com sucesso!");
    });

    it("deve manter estado correto durante operações paralelas", async () => {
        const appointment = { ...baseAppointment };
        getDetailsUseCase.getById.mockResolvedValueOnce(appointment);

        const { result } = renderHook(() =>
            useNutritionistAppointmentDetailsViewModel(
                getDetailsUseCase,
                acceptUseCase,
                rejectUseCase,
                cancelUseCase,
                reactivateUseCase,
                getUserByIdUseCase,
                calendarSyncUseCase,
                appointmentPushNotificationUseCase
            )
        );

        await act(async () => {
            await result.current.loadAppointment("appt-1");
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.processing).toBe(false);
    });
});
