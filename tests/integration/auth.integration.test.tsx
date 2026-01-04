import { act, renderHook } from "@testing-library/react";
import AuthUseCases from "@/usecase/auth/authUseCases";
import useLoginViewModel from "@/viewmodel/auth/useLoginViewModel";
import useSignUpViewModel from "@/viewmodel/auth/useSignUpViewModel";
import useHomeViewModel from "@/viewmodel/auth/useHomeViewModel";
import { InMemoryAuthService, InMemoryUserRepository, flushPromises } from "./helpers/inMemoryStores";

describe("Auth integration", () => {
    it("signs up, logs in, and logs out with redirects", async () => {
        const authService = new InMemoryAuthService();
        const userRepository = new InMemoryUserRepository();
        const authUseCases = new AuthUseCases(authService, userRepository);

        const { result: signUpResult } = renderHook(() => useSignUpViewModel(authUseCases));

        await act(async () => {
            await signUpResult.current.signUp("Ana Silva", "ana@example.com", "senha123", "senha123");
        });

        expect(signUpResult.current.user?.email).toBe("ana@example.com");
        const users = await userRepository.getByRole("patient");
        expect(users).toHaveLength(1);

        const { result: loginResult } = renderHook(() => useLoginViewModel(authUseCases));

        await act(async () => {
            await loginResult.current.login("ana@example.com", "senha123");
        });

        expect(loginResult.current.user?.id).toBe(users[0].id);
        expect(loginResult.current.redirectRoute).toBe("/patient-home");

        const calendarPermissionUseCase = {
            checkPermission: jest.fn().mockResolvedValue("authorized"),
            requestPermission: jest.fn().mockResolvedValue("authorized"),
            openSettings: jest.fn().mockResolvedValue(undefined),
        };
        const pushPermissionUseCase = {
            checkPermission: jest.fn().mockResolvedValue("granted"),
            requestPermission: jest.fn().mockResolvedValue("granted"),
            openSettings: jest.fn().mockResolvedValue(undefined),
        };
        const pushTokenUseCase = {
            register: jest.fn(),
            unregister: jest.fn(),
        };
        const { result: homeResult } = renderHook(() =>
            useHomeViewModel(
                authUseCases,
                calendarPermissionUseCase,
                pushPermissionUseCase,
                pushTokenUseCase
            )
        );

        await act(async () => {
            await flushPromises();
        });

        expect(homeResult.current.startupRedirect).toBe("/patient-home");

        await act(async () => {
            await homeResult.current.logout();
        });

        expect(homeResult.current.unauthenticatedRedirect).toBe("/login");
    });

    it("handles reset password success and error", async () => {
        const authService = new InMemoryAuthService();
        const userRepository = new InMemoryUserRepository();
        const authUseCases = new AuthUseCases(authService, userRepository);

        const { result: signUpResult } = renderHook(() => useSignUpViewModel(authUseCases));
        await act(async () => {
            await signUpResult.current.signUp("Joao", "joao@example.com", "senha123", "senha123");
        });

        const { result: loginResult } = renderHook(() => useLoginViewModel(authUseCases));

        await act(async () => {
            await loginResult.current.resetPassword("joao@example.com");
        });

        expect(loginResult.current.resetSuccess).toBeTruthy();
        expect(loginResult.current.emailError).toBeNull();

        await act(async () => {
            await loginResult.current.resetPassword("invalido@example.com");
        });

        expect(loginResult.current.emailError).toBeTruthy();
    });
});
