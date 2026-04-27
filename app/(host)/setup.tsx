import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { NavBar } from "@/src/ui/NavBar";
import { colors } from "@/src/theme/colors";
import type { HostGameCard } from "@/src/dto/game.dto";
import { clearStoredSession } from "@/src/auth/session";
import {hostApi} from "@/src/api/host";
import {Card} from "@/src/ui/Card";
import { mixpanel } from "@/src/analytics/mixpanel";

export default function SetupScreen() {
    const router = useRouter();

    const [items, setItems] = useState<HostGameCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await hostApi.listGames({ limit: 50, offset: 0 });
            setItems(res.items);
            void mixpanel.track("Host Games List Viewed", {
                result: "success",
                items_count: res.items?.length ?? 0,
            });
        } catch (e: any) {
            if (e?.status === 401) {
                await clearStoredSession();
                router.replace("/login");
                return;
            }
            setError(e?.message ?? "Failed to load games");
            void mixpanel.track("Host Games List Viewed", {
                result: "fail",
                error_message: e?.message ?? String(e),
                status: e?.status,
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
                title="Игры"
                leftText="Выйти"
                rightText="Создать игру"
                onLeftPress={async () => {
                    void mixpanel.track("Host Logout Clicked");
                    await clearStoredSession();
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
                                    buttonTitle="Open"
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
