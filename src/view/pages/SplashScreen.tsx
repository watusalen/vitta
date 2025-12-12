import { useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, spacing, fontSizes, borderRadius } from '@/view/themes/theme';
import LoadingIndicator from '@/view/components/LoadingIndicator';
import { authUseCases } from '@/di/container';

export default function SplashScreen() {
    useEffect(() => {
        const unsubscribe = authUseCases.onAuthStateChanged((user) => {
            setTimeout(() => {
                if (user) {
                    if (user.role === 'nutritionist') {
                        router.replace('/nutritionist-home');
                    } else {
                        router.replace('/patient-home');
                    }
                } else {
                    router.replace('/login');
                }
            }, 1500);
        });

        return () => unsubscribe();
    }, []);

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
        fontFamily: fonts.medium,
        color: colors.text,
        marginTop: spacing.sm,
    },
    loaderWrapper: {
        position: 'absolute',
        bottom: spacing.xxl,
    },
});
