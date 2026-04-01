import React from "react";
import { Pressable, View } from "react-native";
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
    const questions = ((selectedRound?.questions as UIQuestion[]) ?? []);

    return (
        <View>
            <Text variant="h3" style={{ marginBottom: 10 }}>Questions</Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
                {/* Rounds */}
                <View style={{ flex: 1, gap: 10, maxWidth: 300 }}>
                    <Button title="Add round" variant="secondary" onPress={onAddRound} />

                    <View style={{ gap: 10 }}>
                        {rounds.map((r) => {
                            const rk = roundKey(r);
                            const active = rk === selectedRoundKey;

                            return (
                                <ListItem
                                    key={rk}
                                    title={`${r.round_number}. ${r.name ? r.name : ""}`}
                                    description={`${(r.questions?.length ?? 0)} questions`}
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
                    <Button title="Add question" variant="secondary" disabled={!selectedRound} onPress={onAddQuestion} />

                    <View style={{ gap: 10 }}>
                        {questions.map((q) => {
                            const qk = questionKey(q);
                            const active = qk === selectedQuestionKey;

                            return (
                                <ListItem
                                    key={qk}
                                    title={`Question ${q.question_number}`}
                                    description={q.text ? q.text.slice(0, 40) : "No text yet"}
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
                                label="Question"
                                value={selectedQuestion.text}
                                placeholder="Type question text"
                                onChangeText={(v) => onUpdateSelectedQuestion({text: v})}
                            />

                            <TextField
                                label="Answer"
                                value={selectedQuestion.answer}
                                placeholder="Type answer"
                                onChangeText={(v) => onUpdateSelectedQuestion({answer: v})}
                            />

                            <View style={{flexDirection: "row", gap: 18}}>
                                <View style={{flex: 1}}>
                                    <NumberInput
                                        title="Time to think (sec)"
                                        value={selectedQuestion.time_to_think_sec}
                                        min={0}
                                        max={999}
                                        onChange={(v) => onUpdateSelectedQuestion({time_to_think_sec: v})}
                                    />
                                </View>

                                <View style={{flex: 1}}>
                                    <NumberInput
                                        title="Time to answer (sec)"
                                        value={selectedQuestion.time_to_answer_sec}
                                        min={0}
                                        max={999}
                                        onChange={(v) => onUpdateSelectedQuestion({time_to_answer_sec: v})}
                                    />
                                </View>
                            </View>

                            <TextField
                                label="Round name"
                                value={selectedRound?.name ?? ""}
                                placeholder="Round name"
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
                                Select a round and add a question to edit.
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}
