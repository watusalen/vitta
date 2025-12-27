import { useMemo } from "react";
import { colors } from "@/view/themes/theme";

export default function useAgendaCalendarMarks(markedDates: Set<string>, selectedDate: Date | null) {
    return useMemo(() => {
        const marks: Record<string, any> = {};

        markedDates.forEach((date) => {
            marks[date] = {
                marked: true,
                dotColor: colors.primary,
            };
        });

        if (selectedDate) {
            const selectedStr = selectedDate.toISOString().split("T")[0];
            marks[selectedStr] = {
                ...marks[selectedStr],
                selected: true,
                selectedColor: colors.primary,
            };
        }

        return marks;
    }, [markedDates, selectedDate]);
}
