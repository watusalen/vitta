import React, { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { colors, fonts, spacing, fontSizes, borderRadius } from "@/view/themes/theme";
import { listNutritionistAgendaUseCase, userRepository } from "@/di/container";
import useHomeViewModel from "@/viewmodel/auth/useHomeViewModel";
import useNutritionistAgendaViewModel, { AgendaFilter, AgendaAppointmentItem } from "@/viewmodel/nutritionist/useNutritionistAgendaViewModel";
import { authUseCases } from "@/di/container";
import ScreenHeader from "@/view/components/ScreenHeader";
import ErrorScreen from "@/view/components/ErrorScreen";
import AppointmentCard from "@/view/components/AppointmentCard";
import EmptyStateCard from "@/view/components/EmptyStateCard";

// Configurar locale português
LocaleConfig.locales["pt-br"] = {
    monthNames: [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ],
    monthNamesShort: [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez",
    ],
    dayNames: [
        "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
    ],
    dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

export default function AgendaScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useHomeViewModel(authUseCases);
    const nutritionistId = user?.id || "";

    const {
        selectedDateAppointments,
        selectedDateFormatted,
        selectedDate,
        filter,
        markedDates,
        loading,
        refreshing,
        error,
        selectDate,
        setFilter,
        refresh,
        retry,
    } = useNutritionistAgendaViewModel(listNutritionistAgendaUseCase, userRepository, nutritionistId);

    const calendarMarkedDates = useMemo(() => {
        const marks: Record<string, any> = {};

        markedDates.forEach((date) => {
            marks[date] = {
                marked: true,
                dotColor: colors.success,
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

    function handleDayPress(day: { dateString: string }) {
        const [y, m, d] = day.dateString.split("-").map(Number);
        selectDate(new Date(y, m - 1, d, 12, 0, 0));
    }

    const filters: { key: AgendaFilter; label: string }[] = [
        { key: "today", label: "Hoje" },
        { key: "week", label: "Semana" },
        { key: "all", label: "Todos" },
    ];

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

            <View style={styles.filtersContainer}>
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[
                            styles.filterButton,
                            filter === f.key && styles.filterButtonActive,
                        ]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                filter === f.key && styles.filterButtonTextActive,
                            ]}
                        >
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

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
                        dotColor: colors.success,
                        selectedDotColor: colors.background,
                        arrowColor: colors.text,
                        monthTextColor: colors.text,
                        textDayFontFamily: fonts.semibold,
                        textMonthFontFamily: fonts.bold,
                        textDayHeaderFontFamily: fonts.medium,
                        textDayFontSize: fontSizes.md,
                        textMonthFontSize: fontSizes.lg + 2,
                        textDayHeaderFontSize: fontSizes.sm,
                    }}
                    markedDates={calendarMarkedDates}
                    onDayPress={handleDayPress}
                    enableSwipeMonths
                />
            </View>

            <View style={styles.appointmentsSection}>
                {selectedDate ? (
                    <>
                        <Text style={styles.sectionTitle}>{selectedDateFormatted}</Text>
                        {selectedDateAppointments.length === 0 ? (
                            <EmptyStateCard
                                title="Dia livre!"
                                subtitle="Nenhuma consulta agendada para este dia."
                                icon="calendar"
                            />
                        ) : (
                            <FlatList
                                data={selectedDateAppointments}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }: { item: AgendaAppointmentItem }) => (
                                    <AppointmentCard
                                        date={item.date}
                                        timeStart={item.timeStart}
                                        status={item.status}
                                        onPress={() => {}}
                                    />
                                )}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={refresh}
                                        colors={[colors.primary]}
                                    />
                                }
                            />
                        )}
                    </>
                ) : (
                    <EmptyStateCard
                        title="Selecione um dia"
                        subtitle="Toque em uma data no calendário para ver as consultas."
                        icon="calendar"
                    />
                )}
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
    appointmentsSection: {
        flex: 1,
        padding: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSizes.lg + 2,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: spacing.md,
        textTransform: "capitalize",
    },
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
    emptyDay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: spacing.sm,
    },
    emptyDayText: {
        fontSize: fontSizes.md,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
    },
    selectDayHint: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: spacing.sm,
    },
    selectDayText: {
        fontSize: fontSizes.md,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        textAlign: "center",
    },
});
