import { renderHook, act } from "@testing-library/react";
import usePatientHomeViewModel from "@/viewmodel/patient/usePatientHomeViewModel";

describe("usePatientHomeViewModel", () => {
    it("deve iniciar com estado padrão", () => {
        const { result } = renderHook(() => usePatientHomeViewModel());

        expect(result.current.navigationRoute).toBeNull();
        expect(result.current.navigationMethod).toBe("replace");
    });

    it("deve navegar para agenda", () => {
        const { result } = renderHook(() => usePatientHomeViewModel());

        act(() => {
            result.current.goToSchedule();
        });

        expect(result.current.navigationRoute).toBe("/schedule");
        expect(result.current.navigationMethod).toBe("push");
    });

    it("deve navegar para minhas consultas", () => {
        const { result } = renderHook(() => usePatientHomeViewModel());

        act(() => {
            result.current.goToAppointments();
        });

        expect(result.current.navigationRoute).toBe("/my-appointments");
        expect(result.current.navigationMethod).toBe("push");
    });

    it("deve limpar navegação", () => {
        const { result } = renderHook(() => usePatientHomeViewModel());

        act(() => {
            result.current.goToSchedule();
            result.current.clearNavigation();
        });

        expect(result.current.navigationRoute).toBeNull();
    });
});
