import CalendarPermissionUseCase from "@/usecase/calendar/calendarPermissionUseCase";
import { ICalendarService } from "@/model/services/iCalendarService";

describe("CalendarPermissionUseCase", () => {
    let servico: jest.Mocked<ICalendarService>;
    let sut: CalendarPermissionUseCase;

    beforeEach(() => {
        servico = {
            checkPermissions: jest.fn().mockResolvedValue("granted"),
            requestPermissions: jest.fn().mockResolvedValue("denied"),
            openSettings: jest.fn().mockResolvedValue(undefined),
            createEvent: jest.fn(),
            updateEvent: jest.fn(),
            removeEvent: jest.fn(),
        } as unknown as jest.Mocked<ICalendarService>;

        sut = new CalendarPermissionUseCase(servico);
    });

    it("deve verificar permissões chamando o serviço de calendário", async () => {
        const status = await sut.checkPermission();

        expect(servico.checkPermissions).toHaveBeenCalled();
        expect(status).toBe("granted");
    });

    it("deve solicitar permissão chamando o serviço de calendário", async () => {
        const status = await sut.requestPermission();

        expect(servico.requestPermissions).toHaveBeenCalled();
        expect(status).toBe("denied");
    });

    it("deve abrir configurações de permissão chamando o serviço", async () => {
        await sut.openSettings();

        expect(servico.openSettings).toHaveBeenCalled();
    });
});

