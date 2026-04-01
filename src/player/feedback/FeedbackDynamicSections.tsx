import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Box } from '@/src/ui/Box';
import { Text } from '@/src/ui/Text';
import { Tag } from '@/src/ui/Tag';
import { colors } from '@/src/theme/colors';
import { pickLocalizedString } from '@/src/util/pickLocalizedString';
import type { FeedbackSection } from '@/src/dto/player-feedback.dto';

export function FeedbackDynamicSections({
    sections,
    lang,
    selectionsBySection,
    onToggleChip,
}: Readonly<{
    sections: FeedbackSection[];
    lang: string;
    selectionsBySection: Record<string, string[]>;
    onToggleChip: (sectionKey: string, chipKey: string) => void;
}>) {
    return (
        <>
            {sections.map((section, idx) => {
                const selected = selectionsBySection[section.key] ?? [];
                const sectionTitle =
                    pickLocalizedString(section.title, lang) || section.key;
                return (
                    <React.Fragment key={section.key}>
                        <Text
                            variant="h5"
                            style={[styles.sectionTitle, idx > 0 ? styles.sectionTitleSpaced : null]}
                        >
                            {sectionTitle}
                        </Text>
                        <Box row style={styles.tagWrap} gap={2}>
                            {section.chips.map((chip) => (
                                <Pressable
                                    key={chip.key}
                                    onPress={() => onToggleChip(section.key, chip.key)}
                                >
                                    <Tag
                                        text={pickLocalizedString(chip.name, lang) || chip.key}
                                        variant={selected.includes(chip.key) ? 'solid' : 'light'}
                                    />
                                </Pressable>
                            ))}
                        </Box>
                    </React.Fragment>
                );
            })}
        </>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        color: colors.neutralDark.darkest,
        marginBottom: 12,
    },
    sectionTitleSpaced: {
        marginTop: 24,
    },
    tagWrap: {
        flexWrap: 'wrap',
    },
});
