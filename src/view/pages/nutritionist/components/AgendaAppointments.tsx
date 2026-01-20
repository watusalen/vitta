import React from "react";
import { View, Text, FlatList, RefreshControl, StyleSheet } from "react-native";
import EmptyStateCard from "@/view/components/EmptyStateCard";
import AppointmentCard from "@/view/components/AppointmentCard";
import { colors, fontSizes, fonts, spacing } from "@/view/themes/theme";
import { AgendaAppointmentItem } from "@/viewmodel/nutritionist/types/nutritionistAgendaViewModelTypes";

type AgendaAppointmentsProps = {
    selectedDate: Date | null;
    selectedDateFormatted: string;
    appointments: AgendaAppointmentItem[];
    loading: boolean;
    refreshing: boolean;
    onRefresh: () => void;
    onSelectAppointment: (appointmentId: string) => void;
    paddingBottom?: number;
};

export default function AgendaAppointments({
    selectedDate,
    selectedDateFormatted,
    appointments,
    loading,
    refreshing,
    onRefresh,
    onSelectAppointment,
    paddingBottom = spacing.lg,
}: AgendaAppointmentsProps) {
    if (!selectedDate) {
        return (
            <EmptyStateCard
                title="Selecione um dia"
                subtitle="Toque em uma data no calendário para ver as consultas."
                icon="calendar"
            />
        );
    }

    if (loading && !refreshing) {
        return <View />;
    }

    return (
        <View>
            <Text style={styles.sectionTitle}>{selectedDateFormatted}</Text>
            {appointments.length === 0 ? (
                <EmptyStateCard
                    title="Dia livre!"
                    subtitle="Nenhuma consulta agendada para este dia."
                    icon="calendar"
                />
            ) : (
                <FlatList
                    data={appointments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <AppointmentCard
                            date={item.date}
                            timeStart={item.timeStart}
                            status={item.status}
                            onPress={() => onSelectAppointment(item.id)}
                        />
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: fontSizes.lgMd,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
});
