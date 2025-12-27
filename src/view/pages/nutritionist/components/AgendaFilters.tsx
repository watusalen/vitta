import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { borderRadius, colors, fontSizes, fonts, spacing } from "@/view/themes/theme";

export type AgendaFilterOption = {
    key: "today" | "week" | "all";
    label: string;
};

type AgendaFiltersProps = {
    options: readonly AgendaFilterOption[];
    value: AgendaFilterOption["key"];
    onChange: (value: AgendaFilterOption["key"]) => void;
};

export default function AgendaFilters({ options, value, onChange }: AgendaFiltersProps) {
    return (
        <View style={styles.filtersContainer}>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.key}
                    style={[
                        styles.filterButton,
                        value === option.key && styles.filterButtonActive,
                    ]}
                    onPress={() => onChange(option.key)}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            value === option.key && styles.filterButtonTextActive,
                        ]}
                    >
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    filtersContainer: {
        flexDirection: "row",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    filterButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm + 2,
        borderRadius: borderRadius.full,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterButtonText: {
        fontSize: fontSizes.md,
        fontFamily: fonts.medium,
        color: colors.text,
    },
    filterButtonTextActive: {
        color: colors.background,
    },
});
