import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardTypeOptions,
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
};

export default function TextInputField({
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
}: TextInputFieldProps) {
    const [showPassword, setShowPassword] = useState(false);
    const showError = Boolean(error) || hasError;
    const iconColor = showError ? colors.error : colors.primary;

    const isPassword = secureTextEntry;
    const passwordAutoCapitalize = isPassword ? "none" : autoCapitalize;
    const passwordAutoComplete = isPassword ? "password" : autoComplete;
    const passwordTextContentType = isPassword ? "password" : textContentType;

    return (
        <View style={styles.fieldWrapper}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputContainer, showError && styles.inputContainerError]}>
                <Feather name={icon} size={20} color={iconColor} style={styles.leftIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType={keyboardType}
                    autoCapitalize={passwordAutoCapitalize}
                    secureTextEntry={isPassword && !showPassword}
                    value={value}
                    onChangeText={onChangeText}
                    autoComplete={passwordAutoComplete}
                    textContentType={passwordTextContentType}
                    autoCorrect={!isPassword}
                    importantForAutofill="yes"
                />
                <View style={styles.rightIcons}>
                    {showError && (
                        <Feather name="alert-circle" size={18} color={colors.error} />
                    )}
                    {isPassword && (
                        <TouchableOpacity
                            onPress={() => setShowPassword((prev) => !prev)}
                            style={styles.rightIconButton}
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
}

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
        height: 60,
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
