import React from "react";
import TextInputField from "@/view/pages/auth/components/TextInputField";

type RegisterFormErrors = {
    nameError: string | null;
    emailError: string | null;
    passwordError: string | null;
    confirmPasswordError: string | null;
    formError: string | null;
};

type RegisterFormFieldsProps = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    errors: RegisterFormErrors;
    onNameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
};

export default function RegisterFormFields({
    name,
    email,
    password,
    confirmPassword,
    errors,
    onNameChange,
    onEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,
}: RegisterFormFieldsProps) {
    return (
        <>
            <TextInputField
                label="Nome completo"
                placeholder="Digite seu nome"
                value={name}
                onChangeText={onNameChange}
                icon="user"
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                error={errors.nameError ?? undefined}
                hasError={!!errors.nameError}
            />

            <TextInputField
                label="E-mail"
                placeholder="Digite seu e-mail"
                value={email}
                onChangeText={onEmailChange}
                icon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                error={errors.emailError ?? errors.formError ?? undefined}
                hasError={!!errors.emailError || !!errors.formError}
            />

            <TextInputField
                label="Senha"
                placeholder="Digite sua senha"
                value={password}
                onChangeText={onPasswordChange}
                icon="lock"
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                error={errors.passwordError ?? undefined}
                hasError={!!errors.passwordError}
            />

            <TextInputField
                label="Confirmar senha"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChangeText={onConfirmPasswordChange}
                icon="lock"
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                error={errors.confirmPasswordError ?? undefined}
                hasError={!!errors.confirmPasswordError}
            />
        </>
    );
}
