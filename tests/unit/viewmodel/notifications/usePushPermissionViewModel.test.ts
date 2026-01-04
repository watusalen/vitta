import { act, renderHook } from "@testing-library/react";
import usePushPermissionViewModel from "@/viewmodel/notifications/usePushPermissionViewModel";
import { IPushPermissionUseCase } from "@/usecase/notifications/iPushPermissionUseCase";

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("usePushPermissionViewModel", () => {
    let useCase: jest.Mocked<IPushPermissionUseCase>;

    beforeEach(() => {
        useCase = {
            checkPermission: jest.fn().mockResolvedValue("granted"),
            requestPermission: jest.fn().mockResolvedValue("granted"),
            openSettings: jest.fn().mockResolvedValue(undefined),
        };
    });

    it("deve iniciar com loading true e buscar status", async () => {
        const { result } = renderHook(() => usePushPermissionViewModel(useCase));

        expect(result.current.loading).toBe(true);

        await act(async () => {
            await flushPromises();
        });

        expect(useCase.checkPermission).toHaveBeenCalled();
        expect(result.current.status).toBe("granted");
        expect(result.current.loading).toBe(false);
    });

    it("deve solicitar permissão", async () => {
        useCase.requestPermission.mockResolvedValueOnce("denied");
        const { result } = renderHook(() => usePushPermissionViewModel(useCase));

        await act(async () => {
            await result.current.requestPermission();
        });

        expect(useCase.requestPermission).toHaveBeenCalled();
        expect(result.current.status).toBe("denied");
    });

    it("deve abrir os ajustes", async () => {
        const { result } = renderHook(() => usePushPermissionViewModel(useCase));

        await act(async () => {
            await result.current.openSettings();
        });

        expect(useCase.openSettings).toHaveBeenCalled();
    });
});
