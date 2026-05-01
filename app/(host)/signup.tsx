import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { AuthShell } from "@/src/ui/AuthShell";
import { TextField } from "@/src/ui/TextField";
import { Button } from "@/src/ui/Button";
import { Text } from "@/src/ui/Text";
import { Checkbox } from "@/src/ui/Checkbox";
import { hostApi } from "@/src/api/host";
import { mixpanel } from "@/src/analytics/mixpanel";

function emailDomain(email: string) {
    const at = email.indexOf("@");
    if (at === -1) return undefined;
    return email.slice(at + 1).toLowerCase();
}

export default function SignupScreen() {
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
            const message = e?.message ?? "Registration failed. Please try again.";
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
                <View style={{ gap: 8 }}>
                    <Text variant="h3">Sign up</Text>
                    <Text variant="bodyS" style={{ color: "#71727A" }}>
                        Create an account to get started
                    </Text>
                </View>

                <View style={{ gap: 16 }}>
                    <TextField label={"Name"} value={name} onChangeText={setName} placeholder="Name" />

                    <TextField
                        label={"Email Address"}
                        value={email}
                        onChangeText={(v) => { setError(null); setEmail(v); }}
                        placeholder="name@email.com"
                    />

                    <TextField
                        label={"Password"}
                        value={pw}
                        onChangeText={(v) => { setError(null); setPw(v); }}
                        placeholder="Create a password"
                        secureTextEntry={!showPw}
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
                        value={pw2}
                        onChangeText={(v) => { setError(null); setPw2(v); }}
                        placeholder="Confirm password"
                        secureTextEntry={!showPw2}
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
                        <Text variant="bodyS" style={{ color: "#EF4444" }}>
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
                    <Text variant="bodyS" style={{ color: "#71727A", flex: 1 }}>
                        I&apos;ve read and agree with the{" "}
                        <Text variant="bodyS" style={{ color: "#71727A" }}>
                            Terms and Conditions
                        </Text>{" "}
                        and the{" "}
                        <Text variant="bodyS" style={{ color: "#71727A" }}>
                            Privacy Policy
                        </Text>
                        .
                    </Text>
                </View>

                <Button
                    title={loading ? "Signing up..." : "Sign up"}
                    variant="primary"
                    disabled={loading || !agree || !email || !pw || pw !== pw2}
                    onPress={handleSignup}
                />
            </View>
        </AuthShell>
    );
}
