import React from "react";
import { Pressable, View, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { TextField } from "@/src/ui/TextField";
import { ListItem } from "@/src/ui/ListItem";
import { Icon } from "@/src/ui/Icon";
import { colors } from "@/src/theme/colors";
import { Text } from "@/src/ui/Text";
import { ddmmyyyyToIsoDate, isoDateToDdmmyyyy } from "@/src/util/dateFormat";

export function GameMetaRow({ title, date_of_event, passcode, onChangeTitle, onChangeDate, required }: {
    title: string;
    date_of_event: string;
    passcode?: string | null;
    onChangeTitle: (v: string) => void;
    onChangeDate: (v: string) => void;
    required?: boolean;
}) {
    const { t } = useTranslation();
    const req = required ? " *" : "";

    const getNativeDateValue = () => ddmmyyyyToIsoDate(date_of_event);
    const handleNativeDateChange = (val: string) => {
        if (!val) return;
        onChangeDate(isoDateToDdmmyyyy(val));
    };

    return (
        <View style={{ flexDirection: "row", gap: 24, alignItems: "flex-start" }}>
            <View style={{ flex: 1.5 }}>
                <TextField
                    label={`${t("hostEditorMeta.gameNameLabel")}${req}`}
                    value={title}
                    placeholder={t("hostEditorMeta.gameNamePlaceholder")}
                    onChangeText={onChangeTitle}
                />
            </View>

            <View style={{ flex: 1 }}>
                <Text variant="captionM" style={{ marginBottom: 10, color: colors.neutralDark.medium, fontWeight: '500' }}>
                    {`${t("hostEditorMeta.eventDateLabel")}${req}`}
                </Text>

                {Platform.OS === 'web' ? (
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
                            padding: '0 16px',
                            borderRadius: 12,
                            border: `2px solid ${colors.neutralLight.dark}`,
                            backgroundColor: colors.neutralLight.lightest,
                            color: colors.neutralDark.darkest,
                            fontSize: 16,
                            outline: 'none',
                            fontFamily: 'inherit',
                            width: '100%',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s ease',
                        }}
                    />
                ) : (
                    <TextField
                        value={date_of_event}
                        placeholder="23-01-2026"
                        onChangeText={onChangeDate}
                    />
                )}
            </View>

            <View style={{ flex: 1.2, alignSelf: "flex-end" }}>
                {passcode && (
                    <ListItem
                        variant="highlight"
                        title={passcode}
                        description={t("hostEditorMeta.passcodeDescription")}
                        right={
                            <Pressable onPress={() => {}}>
                                <Icon name="copy" color={colors.highlight.darkest} />
                            </Pressable>
                        }
                    />
                )}
            </View>
        </View>
    );
}