import acceptAppointmentUseCase from "@/usecase/appointment/status/acceptAppointmentUseCase";
import { makeAppointment } from "@/model/factories/makeAppointment";
import { InMemoryAppointmentRepository } from "./helpers/inMemoryStores";

describe("Integração de conflitos de consulta", () => {
    it("aceitar uma consulta rejeita as solicitações pendentes concorrentes", async () => {
        const appointmentRepository = new InMemoryAppointmentRepository();
        const nutritionistId = "nutri-1";
        const date = "2025-05-10";

        await appointmentRepository.create(
            makeAppointment({
                id: "appt-main",
                patientId: "patient-1",
                nutritionistId,
                date,
                timeStart: "09:00",
                timeEnd: "11:00",
                status: "pending",
            })
        );

        await appointmentRepository.create(
            makeAppointment({
                id: "appt-other",
                patientId: "patient-2",
                nutritionistId,
                date,
                timeStart: "09:00",
                timeEnd: "11:00",
                status: "pending",
            })
        );

        const acceptUseCase = new acceptAppointmentUseCase(appointmentRepository);
        await acceptUseCase.acceptAppointment("appt-main");

        const main = await appointmentRepository.getById("appt-main");
        const other = await appointmentRepository.getById("appt-other");

        expect(main?.status).toBe("accepted");
        expect(other?.status).toBe("rejected");
    });
});
