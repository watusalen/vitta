import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export default function useFadeInOnToggle(trigger: boolean) {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const prevTrigger = useRef(trigger);

    useEffect(() => {
        if (prevTrigger.current && !trigger) {
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
        prevTrigger.current = trigger;
    }, [trigger, fadeAnim]);

    return fadeAnim;
}
