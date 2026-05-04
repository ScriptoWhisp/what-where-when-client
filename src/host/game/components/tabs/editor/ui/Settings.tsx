import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
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
                <Text variant="h3">{t("hostEditorSettings.timeSettingsTitle")}</Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 24 }}>
                    <View style={{ flex: 1, minWidth: 200 }}>
                        <NumberInput
                            title={t("hostEditorSettings.thinkTimeSec")}
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
                            title={t("hostEditorSettings.answerTimeSec")}
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
                            title={t("hostEditorSettings.appealTimeMin")}
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
                <Text variant="h3">{t("hostEditorSettings.extraSettingsTitle")}</Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 24 }}>
                    <View style={{ flex: 1, minWidth: 250 }}>
                        <SwitchListItem
                            title={t("hostEditorSettings.showLeaderboard.title")}
                            description={t("hostEditorSettings.showLeaderboard.description")}
                            value={settings.show_leaderboard}
                            onValueChange={(v) => {
                                trackChange("show_leaderboard", settings.show_leaderboard, v);
                                onChange({ ...settings, show_leaderboard: v });
                            }}
                        />
                    </View>

                    <View style={{ flex: 1, minWidth: 250 }}>
                        <SwitchListItem
                            title={t("hostEditorSettings.showQuestions.title")}
                            description={t("hostEditorSettings.showQuestions.description")}
                            value={settings.show_questions}
                            onValueChange={(v) => {
                                trackChange("show_questions", settings.show_questions, v);
                                onChange({ ...settings, show_questions: v });
                            }}
                        />
                    </View>

                    <View style={{ flex: 1, minWidth: 250 }}>
                        <SwitchListItem
                            title={t("hostEditorSettings.showAnswers.title")}
                            description={t("hostEditorSettings.showAnswers.description")}
                            value={settings.show_answers}
                            onValueChange={(v) => {
                                trackChange("show_answers", settings.show_answers, v);
                                onChange({ ...settings, show_answers: v });
                            }}
                        />
                    </View>

                    <View style={{ flex: 1, minWidth: 250 }}>
                        <SwitchListItem
                            title={t("hostEditorSettings.allowAppeals.title")}
                            description={t("hostEditorSettings.allowAppeals.description")}
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