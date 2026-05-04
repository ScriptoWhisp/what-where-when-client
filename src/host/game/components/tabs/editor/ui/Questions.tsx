import React from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "@/src/ui/Text";
import { ListItem } from "@/src/ui/ListItem";
import { TextField } from "@/src/ui/TextField";
import { NumberInput } from "@/src/ui/NumberInput";
import { Button } from "@/src/ui/Button";
import { Icon } from "@/src/ui/Icon";
import { colors } from "@/src/theme/colors";
import { metrics } from "@/src/theme/metrics";
import {UIQuestion, UIRound} from "@/src/host/game/components/tabs/editor/types";
import {questionKey, roundKey} from "@/src/host/game/components/tabs/editor/keys";

export function QuestionsSection({
                                     rounds,
                                     selectedRound,
                                     selectedQuestion,
                                     selectedRoundKey,
                                     selectedQuestionKey,
                                     onAddRound,
                                     onRemoveRound,
                                     onSelectRound,
                                     onAddQuestion,
                                     onRemoveQuestion,
                                     onSelectQuestion,
                                     onUpdateSelectedQuestion,
                                     onUpdateRoundName,
                                 }: {
    rounds: UIRound[];
    selectedRound: UIRound | null;
    selectedQuestion: UIQuestion | null;
    selectedRoundKey: string | null;
    selectedQuestionKey: string | null;

    onAddRound: () => void;
    onRemoveRound: (r: UIRound) => void;
    onSelectRound: (k: string) => void;

    onAddQuestion: () => void;
    onRemoveQuestion: (q: UIQuestion) => void;
    onSelectQuestion: (k: string) => void;

    onUpdateSelectedQuestion: (patch: Partial<UIQuestion>) => void;
    onUpdateRoundName: (name: string) => void;
}) {
    const { t } = useTranslation();
    const questions = ((selectedRound?.questions as UIQuestion[]) ?? []);

    return (
        <View>
            <Text variant="h3" style={{ marginBottom: 10 }}>{t("hostEditorQuestions.title")}</Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
                {/* Rounds */}
                <View style={{ flex: 1, gap: 10, maxWidth: 300 }}>
                    <Button title={t("hostEditorQuestions.addRound")} variant="secondary" onPress={onAddRound} />

                    <View style={{ gap: 10 }}>
                        {rounds.map((r) => {
                            const rk = roundKey(r);
                            const active = rk === selectedRoundKey;

                            return (
                                <ListItem
                                    key={rk}
                                    title={`${r.round_number}. ${r.name ? r.name : ""}`}
                                    description={t("hostEditorQuestions.roundDescription", { count: (r.questions?.length ?? 0) })}
                                    style={{
                                        borderWidth: 2,
                                        borderColor: active ? colors.highlight.darkest : "transparent",
                                        backgroundColor: colors.neutralLight.light,
                                    }}
                                    onPress={() => onSelectRound(rk)}
                                    right={
                                        <Pressable onPress={() => onRemoveRound(r)} hitSlop={10}>
                                            <Icon name="x" />
                                        </Pressable>
                                    }
                                />
                            );
                        })}
                    </View>
                </View>

                {/* Questions */}
                <View style={{ flex: 1, gap: 10, maxWidth: 300 }}>
                    <Button title={t("hostEditorQuestions.addQuestion")} variant="secondary" disabled={!selectedRound} onPress={onAddQuestion} />

                    <View style={{ gap: 10 }}>
                        {questions.map((q) => {
                            const qk = questionKey(q);
                            const active = qk === selectedQuestionKey;

                            return (
                                <ListItem
                                    key={qk}
                                    title={t("hostEditorQuestions.questionTitle", { n: q.question_number })}
                                    description={q.text ? q.text.slice(0, 40) : t("hostEditorQuestions.questionNoText")}
                                    style={{
                                        borderWidth: 2,
                                        borderColor: active ? colors.highlight.darkest : "transparent",
                                        backgroundColor: colors.neutralLight.light,
                                    }}
                                    onPress={() => onSelectQuestion(qk)}
                                    right={
                                        <Pressable onPress={() => onRemoveQuestion(q)} hitSlop={10}>
                                            <Icon name="x" />
                                        </Pressable>
                                    }
                                />
                            );
                        })}
                    </View>
                </View>

                {/* Editor */}
                <View style={{ flex: 1, minWidth: 340 }}>
                    {selectedQuestion ? (
                        <View style={{gap: 12}}>
                            <TextField
                                label={t("hostEditorQuestions.fieldQuestionLabel")}
                                value={selectedQuestion.text}
                                placeholder={t("hostEditorQuestions.fieldQuestionPlaceholder")}
                                onChangeText={(v) => onUpdateSelectedQuestion({text: v})}
                            />

                            <TextField
                                label={t("hostEditorQuestions.fieldAnswerLabel")}
                                value={selectedQuestion.answer}
                                placeholder={t("hostEditorQuestions.fieldAnswerPlaceholder")}
                                onChangeText={(v) => onUpdateSelectedQuestion({answer: v})}
                            />

                            <View style={{flexDirection: "row", gap: 18}}>
                                <View style={{flex: 1}}>
                                    <NumberInput
                                        title={t("hostEditorQuestions.timeToThinkSec")}
                                        value={selectedQuestion.time_to_think_sec}
                                        min={0}
                                        max={999}
                                        onChange={(v) => onUpdateSelectedQuestion({time_to_think_sec: v})}
                                    />
                                </View>

                                <View style={{flex: 1}}>
                                    <NumberInput
                                        title={t("hostEditorQuestions.timeToAnswerSec")}
                                        value={selectedQuestion.time_to_answer_sec}
                                        min={0}
                                        max={999}
                                        onChange={(v) => onUpdateSelectedQuestion({time_to_answer_sec: v})}
                                    />
                                </View>
                            </View>

                            <TextField
                                label={t("hostEditorQuestions.roundNameLabel")}
                                value={selectedRound?.name ?? ""}
                                placeholder={t("hostEditorQuestions.roundNamePlaceholder")}
                                onChangeText={onUpdateRoundName}
                            />
                        </View>
                    ) : (
                        <View style={{
                            padding: 16,
                            borderRadius: metrics.radius.lg,
                            backgroundColor: colors.neutralLight.light
                        }}>
                            <Text variant="bodyS" style={{color: colors.neutralDark.light}}>
                                {t("hostEditorQuestions.emptyHint")}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}
