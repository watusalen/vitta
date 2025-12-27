import { useEffect } from "react";

type Params = {
    loadNutritionist: () => Promise<void>;
    nutritionistId: string | null;
    patientId: string | null;
    loadMonthAvailability: (
        year: number,
        month: number,
        nutritionistId: string,
        patientId?: string
    ) => Promise<void>;
};

export default function useScheduleLifecycle({
    loadNutritionist,
    nutritionistId,
    patientId,
    loadMonthAvailability,
}: Params) {
    useEffect(() => {
        loadNutritionist();
    }, [loadNutritionist]);

    useEffect(() => {
        if (!nutritionistId) return;
        const today = new Date();
        loadMonthAvailability(today.getFullYear(), today.getMonth() + 1, nutritionistId, patientId ?? undefined);
    }, [nutritionistId, patientId, loadMonthAvailability]);
}
