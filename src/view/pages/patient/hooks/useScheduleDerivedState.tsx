import { useMemo } from "react";
import { colors } from "@/view/themes/theme";
import { formatDateISO, formatLongDateTitle } from "@/view/utils/dateFormatters";
import TimeSlot from "@/model/entities/timeSlot";

type Params = {
    selectedDate: Date | null;
    availableSlots: TimeSlot[];
    availabilityMap: Map<string, boolean>;
    nutritionistId: string | null;
    patientId: string | null;
    selectDate: (date: Date, nutritionistId: string, patientId?: string) => Promise<void>;
    selectSlot: (slot: TimeSlot) => void;
    screenWidth: number;
    horizontalPadding: number;
    gap: number;
    columns: number;
};

export default function useScheduleDerivedState({
    selectedDate,
    availableSlots,
    availabilityMap,
    nutritionistId,
    patientId,
    selectDate,
    selectSlot,
    screenWidth,
    horizontalPadding,
    gap,
    columns,
}: Params) {
    const selectedDateISO = selectedDate ? formatDateISO(selectedDate) : null;
    const selectedDateFormatted = useMemo(() => {
        if (!selectedDate) return "";
        return formatLongDateTitle(selectedDate);
    }, [selectedDate]);
    const todayISO = formatDateISO(new Date());
    const times = useMemo(() => availableSlots.map((s) => s.timeStart), [availableSlots]);

    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};

        availabilityMap.forEach((hasAvailability, dateStr) => {
            if (hasAvailability) {
                marks[dateStr] = {
                    marked: true,
                    dotColor: colors.primary,
                };
            } else {
                marks[dateStr] = {
                    disabled: true,
                    disableTouchEvent: true,
                };
            }
        });

        if (selectedDateISO) {
            marks[selectedDateISO] = {
                ...(marks[selectedDateISO] || {}),
                selected: true,
                selectedColor: colors.primary,
            };
        }

        return marks;
    }, [availabilityMap, selectedDateISO]);

    function handleDayPress(day: { dateString: string }) {
        if (!nutritionistId) return;

        const [y, m, d] = day.dateString.split("-").map(Number);
        selectDate(new Date(y, m - 1, d, 12, 0, 0), nutritionistId, patientId ?? undefined);
    }

    function handleSelectTime(time: string) {
        const slot = availableSlots.find((s) => s.timeStart === time);
        if (slot) selectSlot(slot);
    }

    const pillWidth = useMemo(() => {
        const totalGaps = gap * (columns - 1);
        const usable = screenWidth - horizontalPadding * 2 - totalGaps;
        return Math.floor(usable / columns);
    }, [screenWidth, horizontalPadding, gap, columns]);

    return {
        selectedDateISO,
        selectedDateFormatted,
        todayISO,
        times,
        markedDates,
        pillWidth,
        handleDayPress,
        handleSelectTime,
    };
}
