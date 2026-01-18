import React, { useRef } from "react";
import { TextInput } from "react-native";
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

  /**
   * Deve receber a ref do input focado para que a Screen consiga rolar até ele.
   */
  onFocusField?: (inputRef: TextInput | null) => void;
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
  onFocusField,
}: RegisterFormFieldsProps) {
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  return (
    <>
      <TextInputField
        ref={nameRef}
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
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        onFocus={() => onFocusField?.(nameRef.current)}
      />

      <TextInputField
        ref={emailRef}
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
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        onFocus={() => onFocusField?.(emailRef.current)}
      />

      <TextInputField
        ref={passwordRef}
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
        returnKeyType="next"
        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        onFocus={() => onFocusField?.(passwordRef.current)}
      />

      <TextInputField
        ref={confirmPasswordRef}
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
        returnKeyType="done"
        onSubmitEditing={() => {}}
        onFocus={() => onFocusField?.(confirmPasswordRef.current)}
      />
    </>
  );
}