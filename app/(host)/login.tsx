import React, { useState } from "react";
import { View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import { AuthShell } from "@/src/ui/AuthShell";
import { TextField } from "@/src/ui/TextField";
import { Button } from "@/src/ui/Button";
import { Text } from "@/src/ui/Text";
import { Box } from "@/src/ui/Box";
import { hostApi } from "@/src/api/host";
import { mixpanel } from "@/src/analytics/mixpanel";
import { colors } from "@/src/theme/colors";

function emailDomain(email: string) {
    const at = email.indexOf("@");
    if (at === -1) return undefined;
    return email.slice(at + 1).toLowerCase();
}

export default function LoginScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (loading) return;
        setLoading(true);
        setError(null);
        void mixpanel.track("Host Login Submitted", {
            email_domain: emailDomain(email),
        });
        const t0 = Date.now();
        try {
            const res = await hostApi.login({ email, password });
            void mixpanel.track("Host Login Succeeded", {
                host_id: res.user?.id,
                role: res.user?.role,
                response_time_ms: Date.now() - t0,
            });
            await mixpanel.identify(String(res.user?.id), {
                $email: email,
                $name: email,
                role: res.user?.role,
                email_domain: emailDomain(res.user?.email ?? email),
            });
            mixpanel.setSuperProps({
                role: "host",
                host_id: res.user?.id,
                session_present: true,
            });
            router.push("/setup");
        } catch (e: any) {
            const message = e?.message ?? t("hostLogin.errorGeneric");
            setError(message);
            void mixpanel.track("Host Login Failed", {
                email_domain: emailDomain(email),
                error_message: message,
                status: e?.status,
                response_time_ms: Date.now() - t0,
            });
        } finally {
            setLoading(false);
        }
    };

    const pwVisibleLabel = showPw ? t("hostLogin.hidePassword") : t("hostLogin.showPassword");

    return (
        <AuthShell>
            <View style={{ width: 360, gap: 24 }}>
                <View style={{ gap: 16 }}>
                    <Link
                        href="/"
                        onPress={() => {
                            void mixpanel.track("Host Login Back Home Clicked");
                        }}
                    >
                        <Text variant="bodyS" style={{ color: colors.highlight.darkest }}>
                            ← {t("hostLogin.backHome")}
                        </Text>
                    </Link>

                    <Box gap={2}>
                        <Text variant="h3">{t("hostLogin.screenTitle")}</Text>
                        <Text variant="bodyS" style={{ color: colors.neutralDark.light }}>
                            {t("hostLogin.screenSubtitle")}
                        </Text>
                    </Box>
                </View>

                <View style={{ gap: 16 }}>
                    <TextField
                        label={t("hostLogin.emailLabel")}
                        value={email}
                        onChangeText={(v) => {
                            setError(null);
                            setEmail(v);
                        }}
                        placeholder={t("hostLogin.emailPlaceholder")}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                    />

                    <TextField
                        label={t("hostLogin.passwordLabel")}
                        value={password}
                        onChangeText={(v) => {
                            setError(null);
                            setPassword(v);
                        }}
                        placeholder={t("hostLogin.passwordPlaceholder")}
                        secureTextEntry={!showPw}
                        autoCapitalize="none"
                        autoComplete="password"
                        textContentType="password"
                        rightIcon={
                            <Feather
                                name={showPw ? "eye-off" : "eye"}
                                size={22}
                                color={colors.neutralDark.medium}
                            />
                        }
                        rightIconAccessibilityLabel={pwVisibleLabel}
                        onRightIconPress={() => {
                            setShowPw((s) => {
                                void mixpanel.track("Host Login Show Password Toggled", {
                                    visible: !s,
                                });
                                return !s;
                            });
                        }}
                    />

                    {error ? (
                        <Text variant="bodyS" style={{ color: colors.error.dark }}>
                            {error}
                        </Text>
                    ) : null}

                    <Link
                        href="/forgot-password"
                        onPress={() => {
                            void mixpanel.track("Host Login Forgot Password Link Clicked");
                        }}
                    >
                        <Text variant="bodyS" style={{ color: colors.highlight.darkest }}>
                            {t("hostLogin.forgotPassword")}
                        </Text>
                    </Link>
                </View>

                <View style={{ gap: 16 }}>
                    <Button
                        title={loading ? t("hostLogin.loggingIn") : t("hostLogin.login")}
                        variant="primary"
                        disabled={loading}
                        onPress={handleLogin}
                    />

                    <View style={{ alignItems: "center" }}>
                        <Text variant="bodyS" style={{ color: colors.neutralDark.light }}>
                            {t("hostLogin.notMember")}{" "}
                            <Link
                                href="/signup"
                                onPress={() => {
                                    void mixpanel.track("Host Login Register Link Clicked");
                                }}
                            >
                                <Text variant="bodyS" style={{ color: colors.highlight.darkest }}>
                                    {t("hostLogin.registerNow")}
                                </Text>
                            </Link>
                        </Text>
                    </View>
                </View>
            </View>
        </AuthShell>
    );
}
