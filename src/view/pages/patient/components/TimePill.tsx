import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, fonts, fontSizes } from "@/view/themes/theme";

type Props = {
  time: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export default function TimePill({ time, selected, onPress, disabled }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
      style={[
        styles.pill,
        selected && styles.pillActive,
        disabled && styles.pillDisabled,
      ]}
    >
      <Text style={[styles.text, selected && styles.textActive]}>
        {time}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 44,
    borderRadius: 999,

    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",

    alignItems: "center",
    justifyContent: "center",
  },

  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  pillDisabled: {
    opacity: 0.45,
  },

  text: {
    fontSize: fontSizes.smMd,
    fontFamily: fonts.medium,
    color: colors.text,
  },

  textActive: {
    color: colors.background,
    fontFamily: fonts.bold,
  },
});
