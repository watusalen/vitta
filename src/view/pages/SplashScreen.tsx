import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing, fontSizes, borderRadius } from '@/view/themes/theme';
import LoadingIndicator from '@/view/components/LoadingIndicator';
import { useAuthHomeViewModel } from '@/di/container';
import useRedirectEffect from '@/view/hooks/useRedirectEffect';

export default function SplashScreen() {
    const { loading, startupRedirect } = useAuthHomeViewModel();
    const [delayedRedirect, setDelayedRedirect] = useState<string | null>(null);

    useEffect(() => {
        if (loading) return;

        const timer = setTimeout(() => {
            setDelayedRedirect(startupRedirect);
        }, 1500);

        return () => clearTimeout(timer);
    }, [startupRedirect, loading]);

    useRedirectEffect(delayedRedirect);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.logoWrapper}>
                <Image
                    source={require('../assets/images/image.png')}
                    style={styles.logo}
                />
            </View>

            <Text style={styles.title}>Vitta</Text>

            <View style={styles.loaderWrapper}>
                <LoadingIndicator />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoWrapper: {
        width: 100,
        height: 100,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    logo: {
        width: 70,
        resizeMode: 'contain',
    },
    title: {
        fontSize: fontSizes.xxl,
        fontFamily: fonts.bold,
        color: colors.text,
        marginTop: spacing.sm,
    },
    loaderWrapper: {
        position: 'absolute',
        bottom: spacing.xxl,
    },
});
