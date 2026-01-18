import React, { forwardRef, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
  TextInputProps,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, spacing, fontSizes, borderRadius } from "@/view/themes/theme";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

type TextInputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: FeatherIconName;

  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";

  error?: string;
  hasError?: boolean;

  autoComplete?: "email" | "password" | "name" | "username" | "off";
  textContentType?: "emailAddress" | "password" | "name" | "username";

  /** ✅ novos (para controle de teclado/scroll) */
  onFocus?: TextInputProps["onFocus"];
  onBlur?: TextInputProps["onBlur"];
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  blurOnSubmit?: TextInputProps["blurOnSubmit"];
  editable?: TextInputProps["editable"];
};

const TextInputField = forwardRef<TextInput, TextInputFieldProps>(function TextInputField(
  {
    label,
    placeholder,
    value,
    onChangeText,
    icon,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "sentences",
    error,
    hasError = false,
    autoComplete,
    textContentType,

    onFocus,
    onBlur,
    returnKeyType,
    onSubmitEditing,
    blurOnSubmit,
    editable = true,
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);

  const showError = Boolean(error) || hasError;
  const iconColor = showError ? colors.error : colors.primary;

  const isPassword = secureTextEntry;

  const resolved = useMemo(() => {
    return {
      autoCapitalize: isPassword ? "none" : autoCapitalize,
      autoComplete: isPassword ? "password" : autoComplete,
      textContentType: isPassword ? "password" : textContentType,
      autoCorrect: !isPassword,
      secureTextEntry: isPassword && !showPassword,
    };
  }, [isPassword, showPassword, autoCapitalize, autoComplete, textContentType]);

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label} maxFontSizeMultiplier={1.2}>
        {label}
      </Text>

      <View style={[styles.inputContainer, showError && styles.inputContainerError]}>
        <Feather name={icon} size={20} color={iconColor} style={styles.leftIcon} />

        <TextInput
          ref={ref}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          autoCapitalize={resolved.autoCapitalize}
          secureTextEntry={resolved.secureTextEntry}
          value={value}
          onChangeText={onChangeText}
          autoComplete={resolved.autoComplete}
          textContentType={resolved.textContentType}
          autoCorrect={resolved.autoCorrect}
          importantForAutofill="yes"
          onFocus={onFocus}
          onBlur={onBlur}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          editable={editable}
        />

        <View style={styles.rightIcons}>
          {showError && <Feather name="alert-circle" size={18} color={colors.error} />}

          {isPassword && (
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.rightIconButton}
              activeOpacity={0.8}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={iconColor}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

export default TextInputField;

const styles = StyleSheet.create({
  fieldWrapper: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSizes.smMd,
    color: colors.text,
    marginBottom: spacing.sm,
    fontFamily: fonts.regular,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.lg + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  inputContainerError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  leftIcon: {
    marginRight: spacing.sm + 4,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text,
    fontFamily: fonts.regular,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rightIconButton: {
    marginLeft: spacing.xs,
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.error,
    fontSize: fontSizes.smMd,
    fontFamily: fonts.regular,
  },
});