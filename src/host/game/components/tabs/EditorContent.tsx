import React from 'react';
import { Platform, ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from "react-i18next";
import { GameMetaRow } from "@/src/host/game/components/tabs/editor/ui/GameMetaRow";
import { SettingsSections } from "@/src/host/game/components/tabs/editor/ui/Settings";
import { CategoriesSection } from "@/src/host/game/components/tabs/editor/ui/Categories";
import { TeamsSection } from "@/src/host/game/components/tabs/editor/ui/Teams";
import { QuestionsSection } from "@/src/host/game/components/tabs/editor/ui/Questions";
import { Button } from "@/src/ui/Button";
import { Box } from "@/src/ui/Box";
import { Text } from "@/src/ui/Text";
import { useGameEditor } from "@/src/host/game/components/tabs/editor/state";
import { colors } from "@/src/theme/colors";
import { TextField } from "@/src/ui/TextField";
import { ddmmyyyyToIsoDate, isoDateToDdmmyyyy } from "@/src/util/dateFormat";

type EditorContentProps = {
    editor: ReturnType<typeof useGameEditor>;
}

export const EditorContent = ({ editor }: EditorContentProps) => {
    const { t } = useTranslation();
    const isCreate = editor.isNew;
    const canCreate =
        Boolean(editor.draft.title?.trim()) &&
        Boolean(editor.draft.date_of_event?.trim());

    if (isCreate) {
        const req = " *";
        const getNativeDateValue = () => ddmmyyyyToIsoDate(editor.draft.date_of_event);

        const handleNativeDateChange = (val: string) => {
            if (!val) return;
            editor.setDate(isoDateToDdmmyyyy(val));
        };

        return (
            <Box flex={1} style={styles.createRoot}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.createScrollContent}
                >
                    <Box style={styles.createForm}>
                    <TextField
                        label={`${t("hostEditorMeta.gameNameLabel")}${req}`}
                        value={editor.draft.title}
                        placeholder={t("hostEditorMeta.gameNamePlaceholder")}
                        onChangeText={editor.setTitle}
                    />

                    <View>
                        <Text variant="bodyS" style={{ marginBottom: 8, fontWeight: "600" }}>
                            {`${t("hostEditorMeta.eventDateLabel")}${req}`}
                        </Text>

                        {Platform.OS === "web" ? (
                            <input
                                type="date"
                                value={getNativeDateValue()}
                                onChange={(e) => handleNativeDateChange(e.target.value)}
                                onFocus={(e) => {
                                    e.target.style.borderColor = colors.highlight.darkest;
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = colors.neutralLight.dark;
                                }}
                                style={{
                                    height: 48,
                                    padding: "0 16px",
                                    borderRadius: 12,
                                    border: `2px solid ${colors.neutralLight.dark}`,
                                    backgroundColor: colors.neutralLight.lightest,
                                    color: colors.neutralDark.darkest,
                                    fontSize: 16,
                                    outline: "none",
                                    fontFamily: "inherit",
                                    width: "100%",
                                    boxSizing: "border-box",
                                }}
                            />
                        ) : (
                            <TextField
                                value={editor.draft.date_of_event}
                                placeholder="23-01-2026"
                                onChangeText={editor.setDate}
                            />
                        )}
                    </View>

                    {editor.saveError && (
                        <View style={{ marginTop: 12 }}>
                            <Text variant="bodyS" style={{ color: colors.error.dark, textAlign: "center" }}>
                                {editor.saveError}
                            </Text>
                        </View>
                    )}

                    <View style={{ marginTop: 16 }}>
                        <Button
                            title={t("hostEditor.createGame")}
                            variant="primary"
                            disabled={!canCreate}
                            onPress={editor.primaryAction}
                        />
                    </View>
                    </Box>
                </ScrollView>
            </Box>
        );
    }

    return (
        <Box style={{ flex: 1, position: 'relative' }}>

            <ScrollView
                contentContainerStyle={{
                    margin: 10,
                    gap: 48,
                    paddingBottom: 100,
                    paddingTop: 80
                }}
                showsVerticalScrollIndicator={false}
            >

                <GameMetaRow
                    title={editor.draft.title}
                    date_of_event={editor.draft.date_of_event}
                    passcode={editor.loaded?.passcode}
                    onChangeTitle={editor.setTitle}
                    onChangeDate={editor.setDate}
                    required
                />

                <SettingsSections
                    settings={editor.draft.settings}
                    onChange={(next) => editor.setDraft((d) => ({ ...d, settings: next }))}
                />

                <CategoriesSection
                    categories={editor.draft.categories}
                    onAdd={editor.addCategory}
                    onRemove={editor.removeCategory}
                    onUpdate={editor.updateCategory}
                />

                <TeamsSection
                    teams={editor.draft.teams}
                    categories={editor.draft.categories}
                    onAdd={editor.addTeam}
                    onRemove={editor.removeTeam}
                    onUpdate={editor.updateTeam}
                />

                <QuestionsSection
                    rounds={editor.rounds}
                    selectedRound={editor.selectedRound}
                    selectedQuestion={editor.selectedQuestion}
                    selectedRoundKey={editor.selectedRoundKey}
                    selectedQuestionKey={editor.selectedQuestionKey}
                    onAddRound={editor.addRound}
                    onRemoveRound={editor.removeRound}
                    onSelectRound={editor.selectRound}
                    onAddQuestion={editor.addQuestion}
                    onRemoveQuestion={editor.removeQuestion}
                    onSelectQuestion={editor.selectQuestion}
                    onUpdateSelectedQuestion={editor.updateSelectedQuestion}
                    onUpdateRoundName={editor.updateSelectedRoundName}
                />

            </ScrollView>

            <View style={styles.floatingButtonContainer}>
                {editor.saveError && (
                    <View style={{ marginBottom: 8, maxWidth: 300 }}>
                        <Text variant="bodyS" style={{ color: "#EF4444", textAlign: "center" }}>
                            {editor.saveError}
                        </Text>
                    </View>
                )}
                <View style={{ width: 300 }}>
                    <Button
                        title={t("hostEditor.saveAllChanges")}
                        variant="primary"
                        onPress={editor.primaryAction}
                    />
                </View>
            </View>

        </Box>
    );
};

const styles = StyleSheet.create({
    floatingButtonContainer: {
        position: 'absolute',
        top: 16,
        right: 24,
        zIndex: 10,
        elevation: 5,
    },
    createRoot: {
        justifyContent: "flex-start",
        alignItems: "stretch",
        padding: 24,
        paddingTop: 80,
    },
    createScrollContent: {
        paddingBottom: 24,
    },
    createForm: {
        width: "100%",
        maxWidth: 420,
        alignSelf: "center",
        gap: 14,
    },
});