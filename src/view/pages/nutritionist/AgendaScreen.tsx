import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/view/themes/theme";
import { useAuthHomeViewModel, useNutritionistAgendaViewModel } from "@/di/container";
import ScreenHeader from "@/view/components/ScreenHeader";
import ErrorScreen from "@/view/components/ErrorScreen";
import "@/view/config/calendarLocale";
import useRedirectEffect from "@/view/hooks/useRedirectEffect";
import useAgendaCalendarMarks from "@/view/pages/nutritionist/hooks/useAgendaCalendarMarks";
import AgendaFilters from "@/view/pages/nutritionist/components/AgendaFilters";
import AgendaCalendar from "@/view/pages/nutritionist/components/AgendaCalendar";
import AgendaAppointments from "@/view/pages/nutritionist/components/AgendaAppointments";

export default function AgendaScreen() {
    const insets = useSafeAreaInsets();
    const { user, unauthenticatedRedirect } = useAuthHomeViewModel();
    const nutritionistId = user?.id || "";

    const {
        selectedDateAppointments,
        selectedDateFormatted,
        selectedDate,
        filter,
        markedDates,
        loading,
        selectedDateLoading,
        refreshing,
        error,
        navigationRoute,
        navigationMethod,
        selectDate,
        setFilter,
        refresh,
        retry,
        openAppointment,
        clearNavigation,
    } = useNutritionistAgendaViewModel(nutritionistId);

    const calendarMarkedDates = useAgendaCalendarMarks(markedDates, selectedDate);

    function handleDayPress(day: { dateString: string }) {
        const [y, m, d] = day.dateString.split("-").map(Number);
        selectDate(new Date(y, m - 1, d, 12, 0, 0));
    }

    useRedirectEffect(unauthenticatedRedirect);
    useRedirectEffect(navigationRoute, { method: navigationMethod, onComplete: clearNavigation });

    const filters = [
        { key: "today", label: "Hoje" },
        { key: "week", label: "Semana" },
        { key: "all", label: "Todos" },
    ] as const;

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScreenHeader title="Agenda" />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScreenHeader title="Agenda" />
                <ErrorScreen message={error} onRetry={retry} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScreenHeader title="Agenda" />

            <AgendaFilters options={filters} value={filter} onChange={setFilter} />
            <AgendaCalendar markedDates={calendarMarkedDates} onDayPress={handleDayPress} />

            <View style={styles.appointmentsSection}>
                <AgendaAppointments
                    selectedDate={selectedDate}
                    selectedDateFormatted={selectedDateFormatted}
                    appointments={selectedDateAppointments}
                    loading={selectedDateLoading}
                    refreshing={refreshing}
                    onRefresh={refresh}
                    onSelectAppointment={openAppointment}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    appointmentsSection: {
        flex: 1,
        padding: spacing.md,
    },
});
