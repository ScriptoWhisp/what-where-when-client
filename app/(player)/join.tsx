import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    useWindowDimensions
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Button } from '@/src/ui/Button';
import { checkGameByCode } from '@/src/api/player';
import { colors } from '@/src/theme/colors';
import { mixpanel } from "@/src/analytics/mixpanel";

type InputRef = TextInput | null;

export default function JoinScreen() {
    const { t } = useTranslation();
    const [digits, setDigits] = useState<string[]>(['', '', '', '']);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { height } = useWindowDimensions();

    const router = useRouter();
    const inputRefs = useRef<InputRef[]>([]);
    const enteredOnceRef = useRef(false);
    const attemptsRef = useRef(0);
    const failedAttemptsRef = useRef(0);

    React.useEffect(() => {
        void mixpanel.track("Player Join Mounted");
    }, []);

    const handleJoin = async () => {
        const code = digits.join('');
        if (code.length < 4) return;

        attemptsRef.current += 1;
        const t0 = Date.now();
        setLoading(true);
        setErrorMessage(null);
        Keyboard.dismiss();

        try {
            void mixpanel.track("Player Join Code Submitted", {
                result: "pending",
                attempt: attemptsRef.current,
                previous_failed_attempts: failedAttemptsRef.current,
            });
            const gameData = await checkGameByCode(code);
            void mixpanel.track("Player Join Code Submitted", {
                result: "success",
                response_time_ms: Date.now() - t0,
                attempt: attemptsRef.current,
                previous_failed_attempts: failedAttemptsRef.current,
                teams_count: Array.isArray(gameData?.teams) ? gameData.teams.length : undefined,
                game_id: (gameData as any)?.gameId,
            });
            router.push({
                pathname: '/(player)/select-team',
                params: { gameData: JSON.stringify(gameData), code }
            });
        } catch (e: any) {
            failedAttemptsRef.current += 1;
            setErrorMessage(e.message || t('player.join.errors.notFound'));
            void mixpanel.track("Player Join Code Submitted", {
                code,
                result: "fail",
                error_message: e?.message ?? String(e),
                response_time_ms: Date.now() - t0,
                attempt: attemptsRef.current,
                failed_attempts: failedAttemptsRef.current,
            });
            setDigits(['', '', '', '']);
            setFocusedIndex(null);
            Keyboard.dismiss();
        } finally {
            setLoading(false);
        }
    };

    const handleChangeText = (text: string, index: number) => {
        if (errorMessage) setErrorMessage(null);

        if (text.length > 1) {
            const newDigits = text.slice(0, 4).split('');
            setDigits(newDigits);
            if (newDigits.length === 4) {
                if (!enteredOnceRef.current) {
                    enteredOnceRef.current = true;
                    void mixpanel.track("Player Join Code Entered", {
                        code_length: 4,
                        input_method: "paste",
                        has_error_before: Boolean(errorMessage),
                    });
                }
                setTimeout(() => {
                    inputRefs.current[3]?.focus();
                    Keyboard.dismiss();
                }, 10);
            }
            return;
        }

        const newDigits = [...digits];
        newDigits[index] = text;
        setDigits(newDigits);

        if (text !== '' && index < 3) {
            if (!enteredOnceRef.current && newDigits.join("").length === 4) {
                enteredOnceRef.current = true;
                void mixpanel.track("Player Join Code Entered", {
                    code_length: 4,
                    input_method: "type",
                    has_error_before: Boolean(errorMessage),
                });
            }
            setTimeout(() => {
                inputRefs.current[index + 1]?.focus();
            }, 10);
        }
    };

    const content = (
        <View style={{ flex: 1 }}>
            <Box flex={1} align="center" p={6} style={{ paddingTop: height * 0.2 }}>
                <Box maxWidth={450} width="100%" align="center" style={{ gap: 40 }}>
                    <Box align="center" gap={2} >
                        <Text variant="h3">{t('player.join.title')}</Text>
                        <Text variant="bodyS" style={{ color: colors.neutralDark.light, textAlign: 'center' }}>
                            {t('player.join.hint')}
                        </Text>
                    </Box>

                    <Box maxWidth={450} width="100%" align="center" style={{ gap: 8 }}>
                        <Box row gap={2} justify="center">
                            {digits.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { inputRefs.current[index] = ref; }}
                                    style={[
                                        styles.otpInput,
                                        (focusedIndex === index || digit) && styles.otpInputActive,
                                        errorMessage ? styles.otpInputError : null
                                    ]}
                                    value={digit}
                                    onFocus={() => setFocusedIndex(index)}
                                    onBlur={() => setFocusedIndex(null)}
                                    onChangeText={(text) => handleChangeText(text, index)}
                                    onKeyPress={(e) => {
                                        if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
                                            const newDigits = [...digits];
                                            newDigits[index - 1] = '';
                                            setDigits(newDigits);
                                            setTimeout(() => {
                                                inputRefs.current[index - 1]?.focus();
                                            }, 10);
                                        }
                                    }}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    placeholderTextColor={colors.neutralLight.dark}
                                />
                            ))}
                        </Box>
                        <Box height={20} justify="center">
                            {errorMessage && (
                                <Text variant="bodyS" style={{ color: colors.error.dark, fontWeight: '600' }}>
                                    {errorMessage}
                                </Text>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box p={6} gap={3} width="100%" maxWidth={450} style={{ alignSelf: 'center' }}>
                <Button
                    title={t('common.back')}
                    onPress={() => {
                        void mixpanel.track("Player Join Back Clicked", {
                            digits_entered: digits.filter(Boolean).length,
                            attempts: attemptsRef.current,
                            failed_attempts: failedAttemptsRef.current,
                        });
                        router.back();
                    }}
                    variant="tertiary"
                />
                <Button
                    title={loading ? t('common.searching') : t('common.continue')}
                    onPress={handleJoin}
                    disabled={loading || digits.join('').length < 4}
                    variant="primary"
                />
            </Box>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, backgroundColor: colors.neutralLight.lightest }}
        >
            <Stack.Screen options={{ headerShown: false }} />

            {Platform.OS === 'web' ? (
                content
            ) : (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {content}
                </TouchableWithoutFeedback>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    otpInput: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutralLight.dark,
        backgroundColor: colors.neutralLight.lightest,
        textAlign: 'center',
        fontSize: Platform.OS === 'web' ? 16 : 14,
        fontFamily: 'InterBold',
        color: colors.neutralDark.darkest,
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
    },
    otpInputActive: {
        borderColor: colors.highlight.darkest,
    },
    otpInputError: {
        borderColor: colors.error.dark,
    }
});