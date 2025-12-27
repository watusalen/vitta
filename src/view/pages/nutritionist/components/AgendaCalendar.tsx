import React from "react";
import { View, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { borderRadius, colors, fontSizes, fonts, spacing } from "@/view/themes/theme";

type AgendaCalendarProps = {
    markedDates: Record<string, { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }>;
    onDayPress: (day: { dateString: string }) => void;
};

export default function AgendaCalendar({ markedDates, onDayPress }: AgendaCalendarProps) {
    return (
        <View style={styles.calendarCard}>
            <Calendar
                theme={{
                    backgroundColor: "transparent",
                    calendarBackground: "transparent",
                    textSectionTitleColor: colors.textSecondary,
                    selectedDayBackgroundColor: colors.primary,
                    selectedDayTextColor: colors.background,
                    todayTextColor: colors.primary,
                    dayTextColor: colors.text,
                    textDisabledColor: colors.border,
                    dotColor: colors.primary,
                    selectedDotColor: colors.background,
                    arrowColor: colors.text,
                    monthTextColor: colors.text,
                    textDayFontFamily: fonts.bold,
                    textMonthFontFamily: fonts.bold,
                    textDayHeaderFontFamily: fonts.bold,
                    textDayFontSize: fontSizes.md,
                    textMonthFontSize: fontSizes.xl,
                    textDayHeaderFontSize: fontSizes.smMd,
                }}
                markedDates={markedDates}
                onDayPress={onDayPress}
                enableSwipeMonths
            />
        </View>
    );
}

const styles = StyleSheet.create({
    calendarCard: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        padding: spacing.md,
        borderRadius: borderRadius.xl + 6,
        backgroundColor: colors.background,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 2,
    },
});
