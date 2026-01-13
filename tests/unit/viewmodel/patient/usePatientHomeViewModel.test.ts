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

    it("deve permitir múltiplas navegações em sequência", () => {
        const { result } = renderHook(() => usePatientHomeViewModel());

        act(() => {
            result.current.goToSchedule();
        });
        expect(result.current.navigationRoute).toBe("/schedule");

        act(() => {
            result.current.goToAppointments();
        });
        expect(result.current.navigationRoute).toBe("/my-appointments");

        act(() => {
            result.current.clearNavigation();
        });
        expect(result.current.navigationRoute).toBeNull();
    });

    it("deve manter método de navegação como push após goToSchedule", () => {
        const { result } = renderHook(() => usePatientHomeViewModel());

        act(() => {
            result.current.goToSchedule();
        });

        expect(result.current.navigationMethod).toBe("push");
    });

    it("deve manter método de navegação como push após goToAppointments", () => {
        const { result } = renderHook(() => usePatientHomeViewModel());

        act(() => {
            result.current.goToAppointments();
        });

        expect(result.current.navigationMethod).toBe("push");
    });

    it("deve ser possível chamar clearNavigation múltiplas vezes", () => {
        const { result } = renderHook(() => usePatientHomeViewModel());

        act(() => {
            result.current.goToSchedule();
        });

        act(() => {
            result.current.clearNavigation();
        });
        expect(result.current.navigationRoute).toBeNull();

        act(() => {
            result.current.clearNavigation();
        });
        expect(result.current.navigationRoute).toBeNull();
    });

    it("deve ter callbacks estáveis entre re-renders", () => {
        const { result, rerender } = renderHook(() => usePatientHomeViewModel());

        const goToScheduleRef = result.current.goToSchedule;
        const goToAppointmentsRef = result.current.goToAppointments;
        const clearNavigationRef = result.current.clearNavigation;

        rerender();

        expect(result.current.goToSchedule).toBe(goToScheduleRef);
        expect(result.current.goToAppointments).toBe(goToAppointmentsRef);
        expect(result.current.clearNavigation).toBe(clearNavigationRef);
    });

    it("deve retornar um objeto com todas as propriedades esperadas", () => {
        const { result } = renderHook(() => usePatientHomeViewModel());

        expect(result.current).toHaveProperty("navigationRoute");
        expect(result.current).toHaveProperty("navigationMethod");
        expect(result.current).toHaveProperty("goToSchedule");
        expect(result.current).toHaveProperty("goToAppointments");
        expect(result.current).toHaveProperty("clearNavigation");
    });
});
