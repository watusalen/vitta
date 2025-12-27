import React from "react";
import { View, StyleSheet } from "react-native";
import InfoRow from "@/view/components/InfoRow";
import { colors, spacing } from "@/view/themes/theme";

type Props = {
    patientName: string;
};

export default function NutritionistAppointmentDetailsInfoCard({ patientName }: Props) {
    return (
        <View style={styles.card}>
            <InfoRow icon="user" title={patientName} subtitle="Paciente" />
            <View style={styles.divider} />
            <InfoRow icon="map-pin" title="Consultório Andrade" subtitle="Rua Cícero Medeiros Barbosa, 700, Prado - Piripiri, Piauí" />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.background,
        borderRadius: 24,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.04)",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
        elevation: 1,
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(0,0,0,0.06)",
        marginVertical: spacing.sm,
    },
});
