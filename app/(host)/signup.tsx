import React, { useState } from "react";
import { View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import { AuthShell } from "@/src/ui/AuthShell";
import { TextField } from "@/src/ui/TextField";
import { Button } from "@/src/ui/Button";
import { Text } from "@/src/ui/Text";
import { Checkbox } from "@/src/ui/Checkbox";
import { hostApi } from "@/src/api/host";
import { mixpanel } from "@/src/analytics/mixpanel";
import { colors } from "@/src/theme/colors";

function emailDomain(email: string) {
    const at = email.indexOf("@");
    if (at === -1) return undefined;
    return email.slice(at + 1).toLowerCase();
}

export default function SignupScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");
    const [agree, setAgree] = useState(false);

    const [showPw, setShowPw] = useState(false);
    const [showPw2, setShowPw2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async () => {
        if (loading) return;
        setLoading(true);
        setError(null);
        const t0 = Date.now();
        void mixpanel.track("Host Signup Submitted", {
            email_domain: emailDomain(email),
            agreed_terms: agree,
            name_filled: Boolean(name?.trim()),
            password_length: pw?.length ?? 0,
            passwords_match: pw === pw2,
        });
        try {
            const res = await hostApi.register({ email, password: pw });
            void mixpanel.track("Host Signup Succeeded", {
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
            const message = e?.message ?? t("hostSignup.errorGeneric");
            setError(message);
            void mixpanel.track("Host Signup Failed", {
                email_domain: emailDomain(email),
                error_message: message,
                status: e?.status,
                response_time_ms: Date.now() - t0,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell>
            <View style={{ width: 360, gap: 24 }}>
                <View style={{ gap: 16 }}>
                    <Link
                        href="/"
                        onPress={() => {
                            void mixpanel.track("Host Signup Back Home Clicked");
                        }}
                    >
                        <Text variant="bodyS" style={{ color: colors.highlight.darkest }}>
                            ← {t("hostSignup.backHome")}
                        </Text>
                    </Link>

                    <View style={{ gap: 8 }}>
                        <Text variant="h3">{t("hostSignup.screenTitle")}</Text>
                        <Text variant="bodyS" style={{ color: colors.neutralDark.light }}>
                            {t("hostSignup.screenSubtitle")}
                        </Text>
                    </View>
                </View>

                <View style={{ gap: 16 }}>
                    <TextField
                        label={t("hostSignup.nameLabel")}
                        value={name}
                        onChangeText={setName}
                        placeholder={t("hostSignup.namePlaceholder")}
                    />

                    <TextField
                        label={t("hostSignup.emailLabel")}
                        value={email}
                        onChangeText={(v) => { setError(null); setEmail(v); }}
                        placeholder={t("hostSignup.emailPlaceholder")}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                    />

                    <TextField
                        label={t("hostSignup.passwordLabel")}
                        value={pw}
                        onChangeText={(v) => { setError(null); setPw(v); }}
                        placeholder={t("hostSignup.passwordPlaceholder")}
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
                        rightIconAccessibilityLabel={showPw ? t("hostSignup.hidePassword") : t("hostSignup.showPassword")}
                        onRightIconPress={() => {
                            setShowPw((s) => {
                                void mixpanel.track("Host Signup Show Password Toggled", {
                                    field: "password",
                                    visible: !s,
                                });
                                return !s;
                            });
                        }}
                    />

                    <TextField
                        label={t("hostSignup.confirmPasswordLabel")}
                        value={pw2}
                        onChangeText={(v) => { setError(null); setPw2(v); }}
                        placeholder={t("hostSignup.confirmPasswordPlaceholder")}
                        secureTextEntry={!showPw2}
                        autoCapitalize="none"
                        autoComplete="password"
                        textContentType="password"
                        rightIcon={
                            <Feather
                                name={showPw2 ? "eye-off" : "eye"}
                                size={22}
                                color={colors.neutralDark.medium}
                            />
                        }
                        rightIconAccessibilityLabel={showPw2 ? t("hostSignup.hidePassword") : t("hostSignup.showPassword")}
                        onRightIconPress={() => {
                            setShowPw2((s) => {
                                void mixpanel.track("Host Signup Show Password Toggled", {
                                    field: "confirm_password",
                                    visible: !s,
                                });
                                return !s;
                            });
                        }}
                    />

                    {error && (
                        <Text variant="bodyS" style={{ color: colors.error.dark }}>
                            {error}
                        </Text>
                    )}
                </View>

                <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                    <Checkbox
                        checked={agree}
                        onChange={(v) => {
                            void mixpanel.track("Host Signup Terms Toggled", {
                                agreed: v,
                            });
                            setAgree(v);
                        }}
                    />
                    <Text variant="bodyS" style={{ color: colors.neutralDark.light, flex: 1 }}>
                        {t("hostSignup.agreeText")}
                    </Text>
                </View>

                <View style={{ gap: 12 }}>
                    <Button
                        title={loading ? t("hostSignup.signingUp") : t("hostSignup.signUp")}
                        variant="primary"
                        disabled={loading || !agree || !email || !pw || pw !== pw2}
                        onPress={handleSignup}
                    />

                    <View style={{ alignItems: "center" }}>
                        <Text variant="bodyS" style={{ color: colors.neutralDark.light }}>
                            {t("hostSignup.haveAccount")}{" "}
                            <Link
                                href="/login"
                                onPress={() => {
                                    void mixpanel.track("Host Signup Back To Login Clicked");
                                }}
                            >
                                <Text variant="bodyS" style={{ color: colors.highlight.darkest }}>
                                    {t("hostSignup.signIn")}
                                </Text>
                            </Link>
                        </Text>
                    </View>
                </View>
            </View>
        </AuthShell>
    );
}
