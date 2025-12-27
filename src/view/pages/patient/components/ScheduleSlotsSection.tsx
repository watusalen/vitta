import React from "react";
import { ActivityIndicator, FlatList, Text, View, StyleSheet } from "react-native";
import { colors, fontSizes, fonts, spacing } from "@/view/themes/theme";
import TimePill from "@/view/pages/patient/components/TimePill";
import EmptyStateCard from "@/view/components/EmptyStateCard";

type Props = {
    selectedDate: Date | null;
    selectedDateFormatted: string;
    loading: boolean;
    times: string[];
    selectedTime: string | null;
    pillWidth: number;
    gap: number;
    onSelectTime: (time: string) => void;
};

export default function ScheduleSlotsSection({
    selectedDate,
    selectedDateFormatted,
    loading,
    times,
    selectedTime,
    pillWidth,
    gap,
    onSelectTime,
}: Props) {
    if (!selectedDate) {
        return (
            <EmptyStateCard
                icon="calendar"
                title="Selecione um dia"
                subtitle="Toque em uma data no calendário para ver os horários."
            />
        );
    }

    return (
        <View>
            <Text style={styles.sectionTitle}>{selectedDateFormatted}</Text>
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            ) : times.length === 0 ? (
                <EmptyStateCard
                    icon="calendar"
                    title="Nenhum horário disponível"
                    subtitle="Não há horários livres para este dia."
                />
            ) : (
                <FlatList
                    data={times}
                    keyExtractor={(item) => item}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timesContent}
                    ItemSeparatorComponent={() => <View style={{ width: gap }} />}
                    renderItem={({ item }) => (
                        <View style={{ width: pillWidth }}>
                            <TimePill
                                time={item}
                                selected={selectedTime === item}
                                onPress={() => onSelectTime(item)}
                            />
                        </View>
                    )}
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
    centered: { paddingVertical: spacing.xl, alignItems: "center", justifyContent: "center" },
    timesContent: {
        paddingTop: spacing.xs,
        paddingBottom: 140,
        paddingHorizontal: spacing.sm,
    },
});
