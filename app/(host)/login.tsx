import React, { useState } from "react";
import { View } from "react-native";
import { Link, useRouter } from "expo-router";
import { AuthShell } from "@/src/ui/AuthShell";
import { TextField } from "@/src/ui/TextField";
import { Button } from "@/src/ui/Button";
import { Text } from "@/src/ui/Text";
import { hostApi } from "@/src/api/host";
import { mixpanel } from "@/src/analytics/mixpanel";

function emailDomain(email: string) {
    const at = email.indexOf("@");
    if (at === -1) return undefined;
    return email.slice(at + 1).toLowerCase();
}

export default function LoginScreen() {
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
            const message = e?.message ?? "Login failed. Please try again.";
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

    return (
        <AuthShell>
            <View style={{ width: 360, gap: 24 }}>
                <View style={{ gap: 16 }}>
                    <TextField
                        value={email}
                        onChangeText={(v) => { setError(null); setEmail(v); }}
                        placeholder="Email Address"
                    />

                    <TextField
                        value={password}
                        onChangeText={(v) => { setError(null); setPassword(v); }}
                        placeholder="Password"
                        secureTextEntry={!showPw}
                        onRightIconPress={() => {
                            setShowPw((s) => {
                                void mixpanel.track("Host Login Show Password Toggled", {
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

                    <Text variant="bodyS" style={{ color: "#71727A" }}>
                        Forgot password?
                    </Text>
                </View>

                <View style={{ gap: 16 }}>
                    <Button
                        title={loading ? "Logging in..." : "Login"}
                        variant="primary"
                        disabled={loading}
                        onPress={handleLogin}
                    />

                    <View style={{ alignItems: "center" }}>
                        <Text variant="bodyS" style={{ color: "#71727A" }}>
                            Not a member?{" "}
                            <Link
                                href="/signup"
                                onPress={() => {
                                    void mixpanel.track("Host Login Register Link Clicked");
                                }}
                            >
                                <Text variant="bodyS" style={{ color: "#006FFD" }}>
                                    Register now
                                </Text>
                            </Link>
                        </Text>
                    </View>
                </View>
            </View>
        </AuthShell>
    );
}
