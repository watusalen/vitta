import Appointment from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { ICalendarService } from "@/model/services/iCalendarService";
import AppointmentCalendarSyncUseCase from "@/usecase/calendar/appointmentCalendarSyncUseCase";

const criarConsulta = (overrides: Partial<Appointment> = {}): Appointment => ({
    id: "appt-1",
    patientId: "paciente-1",
    nutritionistId: "nutri-1",
    date: "2025-05-10",
    timeStart: "09:00",
    timeEnd: "11:00",
    status: "accepted",
    createdAt: new Date("2025-05-01T00:00:00Z"),
    updatedAt: new Date("2025-05-01T00:00:00Z"),
    ...overrides,
});

describe("AppointmentCalendarSyncUseCase", () => {
    let calendario: jest.Mocked<ICalendarService>;
    let repositorio: jest.Mocked<IAppointmentRepository>;
    let sut: AppointmentCalendarSyncUseCase;

    beforeEach(() => {
        calendario = {
            checkPermissions: jest.fn(),
            requestPermissions: jest.fn(),
            openSettings: jest.fn(),
            createEvent: jest.fn().mockResolvedValue("event-1"),
            updateEvent: jest.fn(),
            removeEvent: jest.fn(),
        } as unknown as jest.Mocked<ICalendarService>;

        repositorio = {
            getById: jest.fn().mockResolvedValue(null),
            updateCalendarEventIds: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<IAppointmentRepository>;

        sut = new AppointmentCalendarSyncUseCase(calendario, repositorio);
    });

    it("deve criar evento e salvar id no repositório ao aceitar para o paciente", async () => {
        const consulta = criarConsulta();
        (repositorio.getById as jest.Mock).mockResolvedValue(null);

        await sut.syncAccepted(consulta, "patient");

        expect(calendario.createEvent).toHaveBeenCalledTimes(1);
        const input = (calendario.createEvent as jest.Mock).mock.calls[0][0];
        expect(input.title).toContain("09:00");
        expect(input.notes).toContain("10/05/2025");
        expect(input.reminderMinutesBefore).toEqual([1440]);
        expect(input.startDate).toMatch(/2025-05-10/);
        expect(input.endDate).toMatch(/2025-05-10/);

        expect(repositorio.updateCalendarEventIds).toHaveBeenCalledWith("appt-1", {
            calendarEventIdPatient: "event-1",
        });
    });

    it("deve apenas atualizar evento existente ao aceitar para a nutricionista", async () => {
        const consulta = criarConsulta({ calendarEventIdNutritionist: "event-nutri" });
        (repositorio.getById as jest.Mock).mockResolvedValue(consulta);

        await sut.syncAccepted(consulta, "nutritionist");

        expect(calendario.updateEvent).toHaveBeenCalledWith("event-nutri", expect.any(Object));
        expect(calendario.createEvent).not.toHaveBeenCalled();
        expect(repositorio.updateCalendarEventIds).not.toHaveBeenCalled();
    });

    it("deve remover evento e limpar id ao cancelar ou rejeitar quando existir evento", async () => {
        const consulta = criarConsulta({ calendarEventIdPatient: "evt-paciente" });
        (repositorio.getById as jest.Mock).mockResolvedValue(consulta);

        await sut.syncCancelledOrRejected(consulta, "patient");

        expect(calendario.removeEvent).toHaveBeenCalledWith("evt-paciente");
        expect(repositorio.updateCalendarEventIds).toHaveBeenCalledWith("appt-1", {
            calendarEventIdPatient: null,
        });
    });

    it("não deve chamar serviço ou repositório ao cancelar sem evento associado", async () => {
        const consulta = criarConsulta();
        (repositorio.getById as jest.Mock).mockResolvedValue(null);

        await sut.syncCancelledOrRejected(consulta, "nutritionist");

        expect(calendario.removeEvent).not.toHaveBeenCalled();
        expect(repositorio.updateCalendarEventIds).not.toHaveBeenCalled();
    });
});
