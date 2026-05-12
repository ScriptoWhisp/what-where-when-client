import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { NavBar } from "@/src/ui/NavBar";
import { colors } from "@/src/theme/colors";
import type { HostGameCard } from "@/src/dto/game.dto";
import { clearStoredSession } from "@/src/auth/session";
import {hostApi} from "@/src/api/host";
import {Card} from "@/src/ui/Card";
import { mixpanel } from "@/src/analytics/mixpanel";

export default function SetupScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const [items, setItems] = useState<HostGameCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        const t0 = Date.now();
        try {
            const res = await hostApi.listGames({ limit: 50, offset: 0 });
            setItems(res.items);
            void mixpanel.track("Host Games List Viewed", {
                result: "success",
                items_count: res.items?.length ?? 0,
                response_time_ms: Date.now() - t0,
            });
        } catch (e: any) {
            if (e?.status === 401) {
                void mixpanel.track("Host Session Expired", {
                    response_time_ms: Date.now() - t0,
                });
                await clearStoredSession();
                mixpanel.setSuperProps({
                    role: undefined,
                    host_id: undefined,
                    session_present: false,
                });
                router.replace("/login");
                return;
            }
            setError(e?.message ?? t("hostSetup.loadError"));
            void mixpanel.track("Host Games List Viewed", {
                result: "fail",
                error_message: e?.message ?? String(e),
                status: e?.status,
                response_time_ms: Date.now() - t0,
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: colors.neutralLight.lightest }}>
            <NavBar
                title={t("hostSetup.title")}
                leftText={t("hostSetup.logOut")}
                rightText={t("hostSetup.createGame")}
                onLeftPress={async () => {
                    void mixpanel.track("Host Logout Clicked");
                    await clearStoredSession();
                    mixpanel.setSuperProps({
                        role: undefined,
                        host_id: undefined,
                        session_present: false,
                    });
                    void mixpanel.track("Session Cleared");
                    router.replace("/login");
                }}
                onRightPress={() => {
                    void mixpanel.track("Host Game Create Started");
                    router.push("/game/new" as any);
                }}
            />

            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator />
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    {error ? (
                        <View style={{ marginBottom: 16 }}>
                            {/* Alert */}
                            <View>
                                {/* text */}
                            </View>
                        </View>
                    ) : null}

                    <View
                        style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 18,
                            justifyContent: "center",
                        }}
                    >
                        {items.map((g) => (
                            <View key={g.id} style={{ width: 220 }}>
                                <Card
                                    title={g.title}
                                    subtitle={g.subtitle}
                                    buttonTitle={t("hostSetup.openGame")}
                                    onButtonPress={() => {
                                        void mixpanel.track("Host Game Opened", { game_id: g.id });
                                        router.push(`/game/${g.id}`);
                                    }}
                                />
                            </View>
                        ))}

                    </View>
                </ScrollView>
            )}
        </View>
    );
}
