import React from "react";
import { Text, View, StyleSheet } from "react-native";
import StatusBadge from "@/view/components/StatusBadge";
import { formatDayText } from "@/view/utils/dateFormatters";
import { AppointmentStatus } from "@/model/entities/appointment";
import { colors, fonts, spacing, fontSizes } from "@/view/themes/theme";

type Props = {
    status: AppointmentStatus;
    date: string;
    timeStart: string;
};

export default function AppointmentDetailsHeader({ status, date, timeStart }: Props) {
    return (
        <View>
            <StatusBadge status={status} variant="filled" />
            <Text style={styles.bigTitle}>{formatDayText(date)}</Text>
            <Text style={styles.bigTime}>{timeStart}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    bigTitle: {
        fontSize: fontSizes.xl,
        lineHeight: 46,
        fontFamily: fonts.bold,
        color: colors.text,
        marginTop: spacing.sm - 2,
        marginBottom: spacing.xs,
    },
    bigTime: {
        fontSize: fontSizes.xl,
        fontFamily: fonts.bold,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
});
