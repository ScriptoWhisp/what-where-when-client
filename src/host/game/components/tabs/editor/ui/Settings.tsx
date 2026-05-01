import React from "react";
import { View } from "react-native";
import { Text } from "@/src/ui/Text";
import { NumberInput } from "@/src/ui/NumberInput";
import { SwitchListItem } from "@/src/ui/SwitchListItem";
import { mixpanel } from "@/src/analytics/mixpanel";
import type { GameSettings } from "@/src/dto/game.dto";

export function SettingsSections({
                                     settings,
                                     onChange,
                                 }: {
    settings: GameSettings;
    onChange: (next: GameSettings) => void;
}) {
    const trackChange = (key: string, prev: any, next: any) => {
        void mixpanel.track("Host Editor Setting Changed", {
            setting_key: key,
            value: next,
            previous_value: prev,
            value_type: typeof next,
        });
    };

    return (
        <View style={{ gap: 48 }}>

            <View style={{ gap: 10 }}>
                <Text variant="h3">Настройки времени</Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 24 }}>
                    <View style={{ flex: 1, minWidth: 200 }}>
                        <NumberInput
                            title="Время на обсуждение (сек)"
                            value={settings.time_to_think_sec}
                            min={0}
                            max={999}
                            onChange={(v) => {
                                trackChange("time_to_think_sec", settings.time_to_think_sec, v);
                                onChange({ ...settings, time_to_think_sec: v });
                            }}
                        />
                    </View>

                    <View style={{ flex: 1, minWidth: 200 }}>
                        <NumberInput
                            title="Время на ввод ответа (сек)"
                            value={settings.time_to_answer_sec}
                            min={0}
                            max={999}
                            onChange={(v) => {
                                trackChange("time_to_answer_sec", settings.time_to_answer_sec, v);
                                onChange({ ...settings, time_to_answer_sec: v });
                            }}
                        />
                    </View>

                    <View style={{ flex: 1, minWidth: 200 }}>
                        <NumberInput
                            title="Время на апелляции (мин)"
                            value={settings.time_to_dispute_end_min}
                            min={0}
                            max={999}
                            onChange={(v) => {
                                trackChange("time_to_dispute_end_min", settings.time_to_dispute_end_min, v);
                                onChange({ ...settings, time_to_dispute_end_min: v });
                            }}
                        />
                    </View>
                </View>
            </View>

            <View style={{ gap: 16 }}>
                <Text variant="h3">Дополнительные настройки</Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 24 }}>
                    <View style={{ flex: 1, minWidth: 250 }}>
                        <SwitchListItem
                            title="Показывать таблицу лидеров"
                            description="Команды смогут видеть таблицу результатов во время игры"
                            value={settings.show_leaderboard}
                            onValueChange={(v) => {
                                trackChange("show_leaderboard", settings.show_leaderboard, v);
                                onChange({ ...settings, show_leaderboard: v });
                            }}
                        />
                    </View>

                    <View style={{ flex: 1, minWidth: 250 }}>
                        <SwitchListItem
                            title="Показывать вопросы"
                            description="Текст вопроса будет отображаться на экранах участников"
                            value={settings.show_questions}
                            onValueChange={(v) => {
                                trackChange("show_questions", settings.show_questions, v);
                                onChange({ ...settings, show_questions: v });
                            }}
                        />
                    </View>

                    <View style={{ flex: 1, minWidth: 250 }}>
                        <SwitchListItem
                            title="Показывать ответы"
                            description="Правильные ответы будут показаны участникам после завершения раунда"
                            value={settings.show_answers}
                            onValueChange={(v) => {
                                trackChange("show_answers", settings.show_answers, v);
                                onChange({ ...settings, show_answers: v });
                            }}
                        />
                    </View>

                    <View style={{ flex: 1, minWidth: 250 }}>
                        <SwitchListItem
                            title="Разрешить апелляции"
                            description="Команды смогут оспаривать результаты и подавать апелляции на свои ответы"
                            value={settings.can_appeal}
                            onValueChange={(v) => {
                                trackChange("can_appeal", settings.can_appeal, v);
                                onChange({ ...settings, can_appeal: v });
                            }}
                        />
                    </View>
                </View>
            </View>

        </View>
    );
}