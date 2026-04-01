import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { colors } from '@/src/theme/colors';
import { fetchPlayerFeedbackForm, submitPlayerFeedback } from '@/src/api/player';
import type { FeedbackScreen } from '@/src/dto/player-feedback.dto';
import { FeedbackDynamicSections } from '@/src/player/feedback/FeedbackDynamicSections';
import { parseFeedbackScreen } from '@/src/player/feedback/parseFeedbackScreen';
import i18n from '@/src/i18n';
import {GameHeader} from "@/src/player/components/GameHeader";

function toggleChipInSection(
    prev: Record<string, string[]>,
    sectionKey: string,
    chipKey: string,
): Record<string, string[]> {
    const list = prev[sectionKey] ?? [];
    const nextList = list.includes(chipKey) ? list.filter((k) => k !== chipKey) : [...list, chipKey];
    return { ...prev, [sectionKey]: nextList };
}

export default function PlayerFeedbackScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { gameId, participantId, fromHome } = useLocalSearchParams<{
        gameId?: string;
        participantId?: string;
        /** Set to `'1'` when opened from the home screen (no game context). */
        fromHome?: string;
    }>();

    const isStandaloneFromHome = fromHome === '1';

    const gid = gameId && String(gameId).length > 0 ? parseInt(String(gameId), 10) : NaN;
    const pid =
        participantId && String(participantId).length > 0 ? parseInt(String(participantId), 10) : NaN;

    const [rating, setRating] = useState(0);
    const [selectedBySection, setSelectedBySection] = useState<Record<string, string[]>>({});
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formLoading, setFormLoading] = useState(true);
    const [formError, setFormError] = useState<string | null>(null);
    const [formScreen, setFormScreen] = useState<FeedbackScreen | null>(null);

    useEffect(() => {
        let cancelled = false;
        setFormLoading(true);
        setFormError(null);
        void (async () => {
            try {
                const raw = await fetchPlayerFeedbackForm();
                if (!cancelled) {
                    const parsed = parseFeedbackScreen(raw);
                    if (parsed) {
                        setFormScreen(parsed);
                    } else {
                        setFormError(t('feedback.formLoadError'));
                    }
                }
            } catch {
                if (!cancelled) {
                    setFormError(t('feedback.formLoadError'));
                }
            } finally {
                if (!cancelled) {
                    setFormLoading(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [t]);

    const sections = formScreen?.sections ?? [];

    const onToggleChip = useCallback((sectionKey: string, chipKey: string) => {
        setSelectedBySection((p) => toggleChipInSection(p, sectionKey, chipKey));
    }, []);

    const hasGameContext = Number.isFinite(gid) && Number.isFinite(pid);
    /** In-game flow must include both ids; standalone home flow skips them on purpose. */
    const malformedGameFeedback = !isStandaloneFromHome && !hasGameContext;
    const lang = i18n.language;

    const hasUserInput = useMemo(() => {
        if (rating >= 1) return true;
        if (comment.trim().length > 0) return true;
        return Object.values(selectedBySection).some((keys) => keys.length > 0);
    }, [rating, comment, selectedBySection]);

    const goLeaveWithoutSubmit = useCallback(() => {
        if (submitting) return;
        if (isStandaloneFromHome) {
            router.replace('/');
            return;
        }
        if (!hasGameContext) {
            router.replace('/');
            return;
        }
        router.replace({ pathname: '/(player)/thank-you' });
    }, [submitting, isStandaloneFromHome, hasGameContext, router]);

    const handlePrimaryPress = async () => {
        if (submitting) return;
        if (!hasUserInput) {
            goLeaveWithoutSubmit();
            return;
        }
        if (!hasGameContext && !isStandaloneFromHome) {
            Alert.alert(t('common.error'), t('feedback.errorGeneric'));
            return;
        }
        if (rating < 1) {
            Alert.alert(t('common.error'), t('feedback.ratingRequired'));
            return;
        }

        setSubmitting(true);
        try {
            await submitPlayerFeedback({
                ...(hasGameContext ? { gameId: gid, participantId: pid } : {}),
                payload: {
                    rating,
                    selections: selectedBySection,
                    comment: comment.trim(),
                    locale: i18n.language,
                },
            });
            router.replace({
                pathname: '/(player)/thank-you',
            });
        } catch {
            Alert.alert(t('common.error'), t('feedback.errorGeneric'));
        } finally {
            setSubmitting(false);
        }
    };

    const primaryLabelNoInput = isStandaloneFromHome
        ? t('feedback.returnHome')
        : t('feedback.skip');

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutralLight.lightest }} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
            >
                <GameHeader
                    title={t('feedback.screenTitle')}
                />

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {malformedGameFeedback ? (
                        <Text variant="bodyM" style={{ color: colors.error.dark, textAlign: 'center' }}>
                            {t('feedback.errorGeneric')}
                        </Text>
                    ) : formLoading ? (
                        <Text variant="bodyM" style={styles.muted}>
                            {t('common.loading')}
                        </Text>
                    ) : formError ? (
                        <Text variant="bodyM" style={{ color: colors.error.dark, textAlign: 'center' }}>
                            {formError}
                        </Text>
                    ) : (
                        <>
                            <Text variant="h2" style={styles.mainTitle}>
                                {t('feedback.mainTitle')}
                            </Text>
                            <Text variant="bodyM" style={styles.muted}>
                                {t('feedback.ratingPrompt')}
                            </Text>

                            <Box row justify="flex-start" gap={1} style={{ marginBottom: 56 }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Pressable
                                        key={star}
                                        onPress={() => setRating(star)}
                                        hitSlop={8}
                                        accessibilityRole="button"
                                        accessibilityLabel={`${star}`}
                                    >
                                        <Ionicons
                                            name={rating >= star ? 'star' : 'star-outline'}
                                            size={24}
                                            color={colors.highlight.darkest}
                                        />
                                    </Pressable>
                                ))}
                            </Box>

                            <FeedbackDynamicSections
                                sections={sections}
                                lang={lang}
                                selectionsBySection={selectedBySection}
                                onToggleChip={onToggleChip}
                            />

                            <Text variant="h5" style={[styles.sectionTitle, { marginBottom: 16 }]}>
                                {t('feedback.commentHeading')}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('feedback.commentPlaceholder')}
                                placeholderTextColor={colors.neutralDark.light}
                                value={comment}
                                onChangeText={setComment}
                                multiline
                                textAlignVertical="top"
                            />
                        </>
                    )}
                </ScrollView>

                <Box pb={Platform.OS === 'ios' ? 8 : 6} p={6}>
                    <Button
                        title={hasUserInput ? t('feedback.submit') : primaryLabelNoInput}
                        variant="primary"
                        onPress={handlePrimaryPress}
                        disabled={submitting || (formLoading && (!isStandaloneFromHome || hasUserInput))}
                        loading={submitting}
                    />
                </Box>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 24
    },
    mainTitle: {
        color: colors.neutralDark.darkest,
        marginBottom: 10,
    },
    muted: {
        color: colors.neutralDark.light,
        marginBottom: 20
    },
    sectionTitle: {
        color: colors.neutralDark.darkest,
        marginBottom: 12,
    },
    input: {
        minHeight: 120,
        borderWidth: 1,
        borderColor: colors.neutralLight.medium,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.neutralDark.darkest,
        backgroundColor: colors.neutralLight.lightest,
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
    },
});
