import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { GameMetaRow } from "@/src/host/game/components/tabs/editor/ui/GameMetaRow";
import { SettingsSections } from "@/src/host/game/components/tabs/editor/ui/Settings";
import { CategoriesSection } from "@/src/host/game/components/tabs/editor/ui/Categories";
import { TeamsSection } from "@/src/host/game/components/tabs/editor/ui/Teams";
import { QuestionsSection } from "@/src/host/game/components/tabs/editor/ui/Questions";
import { Button } from "@/src/ui/Button";
import { Box } from "@/src/ui/Box";

interface EditorContentProps {
    editor: any;
}

export const EditorContent = ({ editor }: EditorContentProps) => {
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
                />

                <SettingsSections
                    settings={editor.draft.settings}
                    onChange={(next) => editor.setDraft((d: any) => ({ ...d, settings: next }))}
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
                <View style={{ width: 300 }}>
                    <Button
                        title={editor.isNew ? "Создать игру" : "Сохранить все изменения"}
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
    }
});