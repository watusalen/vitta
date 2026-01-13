import ListAppointmentConflictsUseCase from "@/usecase/appointment/list/listAppointmentConflictsUseCase";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import Appointment from "@/model/entities/appointment";

const criarConsulta = (
    overrides: Partial<Appointment>
): Appointment => ({
    id: overrides.id ?? "id-1",
    nutritionistId: overrides.nutritionistId ?? "nutri-1",
    patientId: overrides.patientId ?? "patient-1",
    date: overrides.date ?? "2026-01-10",
    timeStart: overrides.timeStart ?? "09:00",
    timeEnd: overrides.timeEnd ?? "11:00",
    status: overrides.status ?? "accepted",
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
    calendarEventIdNutritionist: overrides.calendarEventIdNutritionist,
    calendarEventIdPatient: overrides.calendarEventIdPatient,
});

describe("ListAppointmentConflictsUseCase", () => {
    let repositorio: jest.Mocked<IAppointmentRepository>;

    beforeEach(() => {
        repositorio = {
            listByDate: jest.fn(),
        } as unknown as jest.Mocked<IAppointmentRepository>;
    });

    it("deve lançar erro quando o id da nutricionista é vazio", async () => {
        const useCase = new ListAppointmentConflictsUseCase(repositorio);

        await expect(
            useCase.listConflictsBySlot("", "2026-01-10", "09:00", "11:00")
        ).rejects.toThrow("Nutricionista inválida.");
    });

    it("deve buscar consultas do dia com os parâmetros corretos", async () => {
        repositorio.listByDate.mockResolvedValue([]);
        const useCase = new ListAppointmentConflictsUseCase(repositorio);

        await useCase.listConflictsBySlot("nutri-1", "2026-01-10", "09:00", "11:00");

        expect(repositorio.listByDate).toHaveBeenCalledTimes(1);
        expect(repositorio.listByDate).toHaveBeenCalledWith("2026-01-10", "nutri-1");
    });

    it("deve retornar apenas conflitos do mesmo horário com status aceito ou cancelado", async () => {
        const consultas = [
            criarConsulta({ id: "a1", status: "accepted" }),
            criarConsulta({ id: "a2", status: "cancelled" }),
            criarConsulta({ id: "a3", status: "pending" }),
            criarConsulta({ id: "a4", status: "rejected" }),
            criarConsulta({ id: "a5", timeStart: "11:00", timeEnd: "13:00", status: "accepted" }),
        ];

        repositorio.listByDate.mockResolvedValue(consultas);
        const useCase = new ListAppointmentConflictsUseCase(repositorio);

        const result = await useCase.listConflictsBySlot("nutri-1", "2026-01-10", "09:00", "11:00");

        expect(result).toHaveLength(2);
        expect(result.map(r => r.id)).toEqual(["a1", "a2"]);
    });
});
