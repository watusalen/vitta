import React from "react";
import { Calendar } from "react-native-calendars";
import { colors, fonts, fontSizes } from "@/view/themes/theme";

type Props = {
    markedDates: Record<string, any>;
    todayISO: string;
    onDayPress: (day: { dateString: string }) => void;
    onMonthChange: (month: { year: number; month: number }) => void;
};

export default function ScheduleCalendar({
    markedDates,
    todayISO,
    onDayPress,
    onMonthChange,
}: Props) {
    return (
        <Calendar
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
            hideExtraDays
            enableSwipeMonths
            firstDay={0}
            minDate={todayISO}
            markedDates={markedDates}
            markingType="dot"
            disableAllTouchEventsForDisabledDays
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
        />
    );
}
