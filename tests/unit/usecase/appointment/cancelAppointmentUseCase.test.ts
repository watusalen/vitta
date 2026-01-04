import CancelAppointmentUseCase from "@/usecase/appointment/status/cancelAppointmentUseCase";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import Appointment from "@/model/entities/appointment";
import ValidationError from "@/model/errors/validationError";

const createMockRepository = (): jest.Mocked<IAppointmentRepository> => ({
    create: jest.fn(),
    getById: jest.fn(),
    listByPatient: jest.fn(),
    listByDate: jest.fn(),
    listByStatus: jest.fn(),
    listAcceptedByDateRange: jest.fn(),
    listAgendaByDateRange: jest.fn(),
    updateStatus: jest.fn(),
    updateCalendarEventIds: jest.fn(),
    onPatientAppointmentsChange: jest.fn(),
    onNutritionistPendingChange: jest.fn(),
    onNutritionistAppointmentsChange: jest.fn(),
});

const createAppointment = (status: Appointment["status"]): Appointment => ({
    id: "appt-1",
    patientId: "patient-1",
    nutritionistId: "nutri-1",
    date: "2025-12-17",
    timeStart: "09:00",
    timeEnd: "11:00",
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
});

describe("CancelAppointmentUseCase", () => {
    it("deve lançar erro quando id é inválido", async () => {
        const repo = createMockRepository();
        const useCase = new CancelAppointmentUseCase(repo);

        await expect(useCase.cancelAppointment("")).rejects.toThrow(ValidationError);
    });

    it("deve lançar erro quando consulta não existe", async () => {
        const repo = createMockRepository();
        repo.getById.mockResolvedValueOnce(null);
        const useCase = new CancelAppointmentUseCase(repo);

        await expect(useCase.cancelAppointment("appt-1")).rejects.toThrow("Consulta não encontrada.");
    });

    it("deve lançar erro quando status não é cancelável", async () => {
        const repo = createMockRepository();
        repo.getById.mockResolvedValueOnce(createAppointment("rejected"));
        const useCase = new CancelAppointmentUseCase(repo);

        await expect(useCase.cancelAppointment("appt-1")).rejects.toThrow(
            "Apenas consultas pendentes ou aceitas podem ser canceladas."
        );
    });

    it("deve cancelar consulta e retornar atualizada", async () => {
        const repo = createMockRepository();
        repo.getById
            .mockResolvedValueOnce(createAppointment("accepted"))
            .mockResolvedValueOnce(createAppointment("cancelled"));
        repo.updateStatus.mockResolvedValueOnce(undefined);
        const useCase = new CancelAppointmentUseCase(repo);

        const result = await useCase.cancelAppointment("appt-1");

        expect(repo.updateStatus).toHaveBeenCalledWith("appt-1", "cancelled");
        expect(result.status).toBe("cancelled");
    });

    it("deve lançar erro se consulta atualizada não for encontrada", async () => {
        const repo = createMockRepository();
        repo.getById.mockResolvedValueOnce(createAppointment("pending")).mockResolvedValueOnce(null);
        repo.updateStatus.mockResolvedValueOnce(undefined);
        const useCase = new CancelAppointmentUseCase(repo);

        await expect(useCase.cancelAppointment("appt-1")).rejects.toThrow(
            "Erro ao recuperar consulta atualizada."
        );
    });
});
