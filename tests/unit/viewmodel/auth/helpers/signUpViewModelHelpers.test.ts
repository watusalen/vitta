import { validateSignUpInputs, resolveSignUpError, SignUpFieldErrors } from '@/viewmodel/auth/helpers/signUpViewModelHelpers';
import AuthError from '@/model/errors/authError';
import ValidationError from '@/model/errors/validationError';
import RepositoryError from '@/model/errors/repositoryError';

describe('Sign Up View Model Helpers', () => {
    describe('validateSignUpInputs', () => {
        it('deve validar dados de sign up válidos', () => {
            const result = validateSignUpInputs('João Silva', 'joao@example.com', 'senha123', 'senha123');

            expect(result.trimmedName).toBe('João Silva');
            expect(result.trimmedEmail).toBe('joao@example.com');
            expect(result.trimmedPassword).toBe('senha123');
            expect(result.trimmedConfirm).toBe('senha123');
            expect(result.errors.nameError).toBeNull();
            expect(result.errors.emailError).toBeNull();
            expect(result.errors.passwordError).toBeNull();
            expect(result.errors.confirmPasswordError).toBeNull();
            expect(result.errors.formError).toBeNull();
        });

        it('deve retornar erro quando nome é vazio', () => {
            const result = validateSignUpInputs('', 'joao@example.com', 'senha123', 'senha123');

            expect(result.errors.nameError).toBe('Nome é obrigatório');
            expect(result.trimmedName).toBe('');
        });

        it('deve retornar erro quando nome contém apenas espaços', () => {
            const result = validateSignUpInputs('   ', 'joao@example.com', 'senha123', 'senha123');

            expect(result.errors.nameError).toBe('Nome é obrigatório');
        });

        it('deve fazer trim no nome', () => {
            const result = validateSignUpInputs('  João Silva  ', 'joao@example.com', 'senha123', 'senha123');

            expect(result.trimmedName).toBe('João Silva');
        });

        it('deve retornar erro quando email é vazio', () => {
            const result = validateSignUpInputs('João Silva', '', 'senha123', 'senha123');

            expect(result.errors.emailError).toBe('Email é obrigatório');
        });

        it('deve retornar erro quando email é inválido', () => {
            const result = validateSignUpInputs('João Silva', 'emailinvalido', 'senha123', 'senha123');

            expect(result.errors.emailError).toBe('Email inválido');
        });

        it('deve validar email com formato válido', () => {
            const result = validateSignUpInputs('João Silva', 'joao@example.com', 'senha123', 'senha123');

            expect(result.errors.emailError).toBeNull();
        });

        it('deve validar email com domínio múltiplo', () => {
            const result = validateSignUpInputs('João Silva', 'joao@example.co.uk', 'senha123', 'senha123');

            expect(result.errors.emailError).toBeNull();
        });

        it('deve fazer trim no email', () => {
            const result = validateSignUpInputs('João Silva', '  joao@example.com  ', 'senha123', 'senha123');

            expect(result.trimmedEmail).toBe('joao@example.com');
        });

        it('deve retornar erro quando senha é vazia', () => {
            const result = validateSignUpInputs('João Silva', 'joao@example.com', '', 'senha123');

            expect(result.errors.passwordError).toBe('Senha é obrigatória');
        });

        it('deve retornar erro quando senha tem menos de 6 caracteres', () => {
            const result = validateSignUpInputs('João Silva', 'joao@example.com', '12345', '12345');

            expect(result.errors.passwordError).toBe('Senha deve ter pelo menos 6 caracteres');
        });

        it('deve validar senha com 6 caracteres', () => {
            const result = validateSignUpInputs('João Silva', 'joao@example.com', '123456', '123456');

            expect(result.errors.passwordError).toBeNull();
        });

        it('deve fazer trim na senha', () => {
            const result = validateSignUpInputs('João Silva', 'joao@example.com', '  senha123  ', '  senha123  ');

            expect(result.trimmedPassword).toBe('senha123');
        });

        it('deve retornar erro quando confirmação de senha é vazia', () => {
            const result = validateSignUpInputs('João Silva', 'joao@example.com', 'senha123', '');

            expect(result.errors.confirmPasswordError).toBe('Confirme sua senha');
        });

        it('deve retornar erro quando senhas não coincidem', () => {
            const result = validateSignUpInputs('João Silva', 'joao@example.com', 'senha123', 'senha456');

            expect(result.errors.confirmPasswordError).toBe('As senhas não coincidem');
        });

        it('deve retornar erro no campo nome e parar validação', () => {
            const result = validateSignUpInputs('', 'emailinvalido', 'abc', 'xyz');

            expect(result.errors.nameError).toBe('Nome é obrigatório');
            expect(result.errors.emailError).toBeNull();
            expect(result.errors.passwordError).toBeNull();
        });

        it('deve retornar erro no campo email e parar após validação de nome', () => {
            const result = validateSignUpInputs('João Silva', '', 'senha123', 'senha123');

            expect(result.errors.nameError).toBeNull();
            expect(result.errors.emailError).toBe('Email é obrigatório');
        });

        it('deve retornar erro em email inválido e parar validação', () => {
            const result = validateSignUpInputs('João Silva', 'inválido', 'senha123', 'senha123');

            expect(result.errors.nameError).toBeNull();
            expect(result.errors.emailError).toBe('Email inválido');
            expect(result.errors.passwordError).toBeNull();
        });
    });

    describe('resolveSignUpError', () => {
        it('deve retornar defaults quando erro é desconhecido', () => {
            const result = resolveSignUpError('algo aleatório');

            expect(result.nameError).toBeNull();
            expect(result.emailError).toBeNull();
            expect(result.passwordError).toBeNull();
            expect(result.confirmPasswordError).toBeNull();
            expect(result.formError).toBe('Erro desconhecido ao criar conta');
        });

        it('deve mapear ValidationError com "nome" para nameError', () => {
            const error = new ValidationError('Nome inválido');
            const result = resolveSignUpError(error);

            expect(result.nameError).toBe('Nome inválido');
            expect(result.emailError).toBeNull();
            expect(result.formError).toBeNull();
        });

        it('deve mapear ValidationError com "email" para emailError', () => {
            const error = new ValidationError('Email já cadastrado');
            const result = resolveSignUpError(error);

            expect(result.emailError).toBe('Email já cadastrado');
            expect(result.nameError).toBeNull();
            expect(result.formError).toBeNull();
        });

        it('deve mapear ValidationError com "senha" para passwordError', () => {
            const error = new ValidationError('Senha fraca');
            const result = resolveSignUpError(error);

            expect(result.passwordError).toBe('Senha fraca');
            expect(result.nameError).toBeNull();
            expect(result.emailError).toBeNull();
            expect(result.formError).toBeNull();
        });

        it('deve mapear ValidationError genérica para formError', () => {
            const error = new ValidationError('Erro geral de validação');
            const result = resolveSignUpError(error);

            expect(result.formError).toBe('Erro geral de validação');
            expect(result.nameError).toBeNull();
            expect(result.emailError).toBeNull();
        });

        it('deve mapear AuthError para emailError', () => {
            const error = new AuthError('Autenticação falhou');
            const result = resolveSignUpError(error);

            expect(result.emailError).toBe('Autenticação falhou');
            expect(result.nameError).toBeNull();
            expect(result.formError).toBeNull();
        });

        it('deve mapear RepositoryError para formError', () => {
            const error = new RepositoryError('Erro de banco de dados');
            const result = resolveSignUpError(error);

            expect(result.formError).toBe('Erro de banco de dados');
            expect(result.nameError).toBeNull();
            expect(result.emailError).toBeNull();
        });

        it('deve mapear Error genérico para formError', () => {
            const error = new Error('Erro genérico');
            const result = resolveSignUpError(error);

            expect(result.formError).toBe('Erro genérico');
            expect(result.nameError).toBeNull();
            expect(result.emailError).toBeNull();
        });

        it('deve ser case-insensitive ao detectar palavras-chave em ValidationError', () => {
            const nameError = new ValidationError('NOME inválido');
            const emailError = new ValidationError('EMAIL duplicado');
            const passwordError = new ValidationError('SENHA fraca');

            expect(resolveSignUpError(nameError).nameError).toBe('NOME inválido');
            expect(resolveSignUpError(emailError).emailError).toBe('EMAIL duplicado');
            expect(resolveSignUpError(passwordError).passwordError).toBe('SENHA fraca');
        });

        it('deve retornar objeto com todas as propriedades de erro', () => {
            const result = resolveSignUpError(new ValidationError('Teste'));

            expect(result).toHaveProperty('nameError');
            expect(result).toHaveProperty('emailError');
            expect(result).toHaveProperty('passwordError');
            expect(result).toHaveProperty('confirmPasswordError');
            expect(result).toHaveProperty('formError');
        });
    });
});
