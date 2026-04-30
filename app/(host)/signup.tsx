import React, { useState } from "react";
import { View } from "react-native";
import { useRouter, Link } from "expo-router";
import { AuthShell } from "@/src/ui/AuthShell";
import { TextField } from "@/src/ui/TextField";
import { Button } from "@/src/ui/Button";
import { Text } from "@/src/ui/Text";
import { Checkbox } from "@/src/ui/Checkbox";
import {hostApi} from "@/src/api/host";
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

                    <TextField label={"Email Address"} value={email} onChangeText={setEmail} placeholder="name@email.com" />

                    <TextField
                        label={"Password"}
                        value={pw}
                        onChangeText={setPw}
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
                        onChangeText={setPw2}
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
                </View>

                <View style={{ flexDirection: "row", gap: 10, alignItems: "center"}}>
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
                        <Link
                            href="/"
                            onPress={() => {
                                void mixpanel.track("Host Signup Terms Link Clicked", {
                                    link: "terms_and_conditions",
                                });
                            }}
                        >
                            <Text variant="bodyS" style={{ color: "#006FFD" }}>
                                Terms and Conditions
                            </Text>
                        </Link>{" "}
                        and the{" "}
                        <Link
                            href="/"
                            onPress={() => {
                                void mixpanel.track("Host Signup Terms Link Clicked", {
                                    link: "privacy_policy",
                                });
                            }}
                        >
                            <Text variant="bodyS" style={{ color: "#006FFD" }}>
                                Privacy Policy
                            </Text>
                        </Link>
                        .
                    </Text>
                </View>

                <Button
                    title="Login"
                    variant="primary"
                    disabled={!agree || !email || !pw || pw !== pw2}
                    onPress={async () => {
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
                            void mixpanel.track("Host Signup Failed", {
                                email_domain: emailDomain(email),
                                error_message: e?.message ?? String(e),
                                status: e?.status,
                                response_time_ms: Date.now() - t0,
                            });
                        }
                    }}
                />
            </View>
        </AuthShell>
    );
}
