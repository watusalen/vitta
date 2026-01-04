import GetUserByIdUseCase from "@/usecase/user/getUserByIdUseCase";
import { IUserRepository } from "@/model/repositories/iUserRepository";
import ValidationError from "@/model/errors/validationError";

describe("GetUserByIdUseCase", () => {
    let repository: jest.Mocked<IUserRepository>;

    beforeEach(() => {
        repository = {
            getUserByID: jest.fn(),
            createUser: jest.fn(),
            getByRole: jest.fn(),
            addPushToken: jest.fn(),
            removePushToken: jest.fn(),
            getPushTokens: jest.fn(),
        };
    });

    it("deve lançar erro quando id é vazio", async () => {
        const useCase = new GetUserByIdUseCase(repository);

        await expect(useCase.getById("")).rejects.toThrow(ValidationError);
    });

    it("deve retornar usuário quando encontrado", async () => {
        const user = {
            id: "user-1",
            name: "Maria",
            email: "maria@email.com",
            role: "patient" as const,
            createdAt: new Date(),
        };
        repository.getUserByID.mockResolvedValueOnce(user);
        const useCase = new GetUserByIdUseCase(repository);

        const result = await useCase.getById("user-1");

        expect(repository.getUserByID).toHaveBeenCalledWith("user-1");
        expect(result).toEqual(user);
    });
});
