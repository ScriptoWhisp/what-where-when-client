import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Box } from '@/src/ui/Box';
import { Button } from '@/src/ui/Button';
import { Text } from '@/src/ui/Text';
import { colors } from '@/src/theme/colors';
import { metrics } from '@/src/theme/metrics';
import { typography } from '@/src/theme/typography';
import { mixpanel } from '@/src/analytics/mixpanel';
import { setPreferredLanguage, type AppLanguageCode } from '@/src/i18n/languagePreference';

const HOME_LANG_ORDER: AppLanguageCode[] = ['ru', 'en', 'et'];

const LANG_SEGMENT_LABEL: Record<AppLanguageCode, string> = {
    ru: 'RU',
    en: 'EN',
    et: 'ET',
};

function resolveActiveAppLanguage(resolved: string): AppLanguageCode {
    const base = resolved.split('-')[0].toLowerCase();
    if (base === 'en') return 'en';
    if (base === 'et') return 'et';
    return 'ru';
}

function homeLangName(t: (key: string) => string, code: AppLanguageCode): string {
    if (code === 'en') return t('home.langEn');
    if (code === 'et') return t('home.langEt');
    return t('home.langRu');
}

const ICON_ON_PRIMARY = colors.neutralLight.lightest;
const ICON_ON_SECONDARY = colors.highlight.darkest;

const cardShadow = Platform.select({
    ios: {
        shadowColor: '#1F2024',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 28,
    },
    android: {
        elevation: 8,
    },
    default: {
        shadowColor: '#1F2024',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.07,
        shadowRadius: 24,
        elevation: 4,
    },
});

export default function Index() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const resolved = i18n.resolvedLanguage ?? i18n.language ?? 'ru';
    const activeLang = resolveActiveAppLanguage(resolved);

    const pickLanguage = async (code: AppLanguageCode) => {
        if (code === activeLang) return;
        await i18n.changeLanguage(code);
        await setPreferredLanguage(code);
        void mixpanel.track('Home Language Changed', { language: code });
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <StatusBar style="dark" />
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Box width="100%" maxWidth={520} align="stretch" style={{ alignSelf: 'center' }} gap={0}>
                    <Box align="center" mb={5}>
                        <Text variant="captionM" style={styles.langLabel}>
                            {t('home.languageLabel')}
                        </Text>
                        <View style={styles.langTrack}>
                            {HOME_LANG_ORDER.map((code) => {
                                const active = code === activeLang;
                                return (
                                    <Pressable
                                        key={code}
                                        onPress={() => void pickLanguage(code)}
                                        accessibilityRole="button"
                                        accessibilityLabel={homeLangName(t, code)}
                                        accessibilityState={{ selected: active }}
                                        style={({ pressed }) => [
                                            styles.langTrackItem,
                                            active && styles.langTrackItemActive,
                                            pressed && !active && styles.langTrackPressed,
                                        ]}
                                    >
                                        <Text
                                            variant="actionM"
                                            style={active ? styles.langTrackTextActive : styles.langTrackTextIdle}
                                        >
                                            {LANG_SEGMENT_LABEL[code]}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </Box>

                    <Box align="center" gap={3} mb={6}>
                        <Text variant="captionM" style={styles.eyebrow}>
                            {t('home.eyebrow')}
                        </Text>
                        <Text style={styles.heroTitle}>{t('home.title')}</Text>
                        <Text variant="bodyL" style={styles.heroSubtitle}>
                            {t('home.subtitle')}
                        </Text>
                    </Box>

                    <View style={[styles.panel, cardShadow]}>
                        <Text variant="bodyM" style={styles.aboutText}>
                            {t('home.aboutP1')}
                        </Text>
                        <Text variant="bodyM" style={styles.aboutText}>
                            {t('home.aboutP2')}
                        </Text>

                        <View style={styles.panelDivider} />

                        <Box gap={3}>
                            <Button
                                title={t('home.joinGame')}
                                variant="primary"
                                leftIcon={<Ionicons name="people-outline" size={22} color={ICON_ON_PRIMARY} />}
                                onPress={() => {
                                    void mixpanel.track('Home CTA Clicked', { cta: 'join_game' });
                                    router.push('/(player)/join');
                                }}
                            />
                            <Button
                                title={t('home.enterAsHost')}
                                variant="primary"
                                leftIcon={<Ionicons name="easel-outline" size={22} color={ICON_ON_PRIMARY} />}
                                onPress={() => {
                                    void mixpanel.track('Home CTA Clicked', { cta: 'host_login' });
                                    router.push('/(host)/login');
                                }}
                            />
                            <Button
                                title={t('home.feedback')}
                                variant="secondary"
                                leftIcon={
                                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={ICON_ON_SECONDARY} />
                                }
                                onPress={() => {
                                    void mixpanel.track('Home CTA Clicked', { cta: 'feedback' });
                                    router.push({
                                        pathname: '/(player)/feedback' as const,
                                        params: { fromHome: '1' },
                                    });
                                }}
                            />
                        </Box>
                    </View>
                </Box>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.neutralLight.lightest,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: metrics.space[6],
        paddingTop: metrics.space[4],
        paddingBottom: metrics.space[8],
    },
    langLabel: {
        color: colors.neutralDark.light,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginBottom: metrics.space[2],
    },
    langTrack: {
        flexDirection: 'row',
        backgroundColor: colors.neutralLight.medium,
        borderRadius: 999,
        padding: 3,
        alignSelf: 'center',
    },
    langTrackItem: {
        paddingHorizontal: metrics.space[3],
        paddingVertical: metrics.space[2],
        borderRadius: 999,
        minWidth: 56,
        alignItems: 'center',
    },
    langTrackItemActive: {
        backgroundColor: colors.neutralLight.lightest,
        ...Platform.select({
            ios: {
                shadowColor: '#1F2024',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
            },
            android: { elevation: 2 },
            default: {},
        }),
    },
    langTrackPressed: {
        opacity: 0.85,
    },
    langTrackTextActive: {
        color: colors.highlight.darkest,
        fontFamily: typography.fontFamily.semibold,
    },
    langTrackTextIdle: {
        color: colors.neutralDark.light,
        fontFamily: typography.fontFamily.medium,
    },
    eyebrow: {
        color: colors.highlight.dark,
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontFamily: typography.fontFamily.semibold,
    },
    heroTitle: {
        textAlign: 'center',
        fontFamily: typography.fontFamily.extrabold,
        fontSize: 30,
        lineHeight: 36,
        color: colors.neutralDark.darkest,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        textAlign: 'center',
        color: colors.neutralDark.medium,
        fontFamily: typography.fontFamily.medium,
        maxWidth: 400,
        alignSelf: 'center',
    },
    panel: {
        backgroundColor: colors.neutralLight.lightest,
        borderRadius: metrics.radius.xl,
        paddingHorizontal: metrics.space[5],
        paddingVertical: metrics.space[5],
        borderWidth: 1,
        borderColor: 'rgba(197, 198, 204, 0.35)',
    },
    panelDivider: {
        height: 1,
        backgroundColor: colors.neutralLight.dark,
        marginVertical: metrics.space[4],
        opacity: 0.7,
    },
    aboutText: {
        color: colors.neutralDark.dark,
        lineHeight: 22,
    },
    // aboutDivider removed in favor of panelDivider
});
