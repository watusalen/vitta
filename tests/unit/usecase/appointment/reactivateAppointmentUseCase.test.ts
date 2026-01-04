import ReactivateAppointmentUseCase from "@/usecase/appointment/status/reactivateAppointmentUseCase";
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

const createAppointment = (overrides: Partial<Appointment>): Appointment => ({
    id: "appt-1",
    patientId: "patient-1",
    nutritionistId: "nutri-1",
    date: "2025-12-17",
    timeStart: "09:00",
    timeEnd: "11:00",
    status: "cancelled",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

describe("ReactivateAppointmentUseCase", () => {
    it("deve lançar erro quando id é inválido", async () => {
        const repo = createMockRepository();
        const useCase = new ReactivateAppointmentUseCase(repo);

        await expect(useCase.reactivateAppointment("")).rejects.toThrow(ValidationError);
    });

    it("deve lançar erro quando consulta não existe", async () => {
        const repo = createMockRepository();
        repo.getById.mockResolvedValueOnce(null);
        const useCase = new ReactivateAppointmentUseCase(repo);

        await expect(useCase.reactivateAppointment("appt-1")).rejects.toThrow("Consulta não encontrada.");
    });

    it("deve lançar erro quando status não é cancelado", async () => {
        const repo = createMockRepository();
        repo.getById.mockResolvedValueOnce(createAppointment({ status: "accepted" }));
        const useCase = new ReactivateAppointmentUseCase(repo);

        await expect(useCase.reactivateAppointment("appt-1")).rejects.toThrow(
            "Apenas consultas canceladas podem ser reativadas."
        );
    });

    it("deve lançar erro quando existe conflito aceito no mesmo horário", async () => {
        const repo = createMockRepository();
        const cancelled = createAppointment({ status: "cancelled" });
        const acceptedConflict = createAppointment({ id: "appt-2", status: "accepted" });

        repo.getById.mockResolvedValueOnce(cancelled);
        repo.listByDate.mockResolvedValueOnce([cancelled, acceptedConflict]);
        const useCase = new ReactivateAppointmentUseCase(repo);

        await expect(useCase.reactivateAppointment(cancelled.id)).rejects.toThrow(
            "Já existe uma consulta aceita neste horário. Resolva o conflito para continuar."
        );
    });

    it("deve reativar consulta cancelada quando não há conflito", async () => {
        const repo = createMockRepository();
        const cancelled = createAppointment({ status: "cancelled" });
        const accepted = createAppointment({ status: "accepted" });

        repo.getById
            .mockResolvedValueOnce(cancelled)
            .mockResolvedValueOnce(accepted);
        repo.listByDate.mockResolvedValueOnce([cancelled]);
        repo.updateStatus.mockResolvedValueOnce(undefined);
        const useCase = new ReactivateAppointmentUseCase(repo);

        const result = await useCase.reactivateAppointment(cancelled.id);

        expect(repo.updateStatus).toHaveBeenCalledWith(cancelled.id, "accepted");
        expect(result.status).toBe("accepted");
    });
});
