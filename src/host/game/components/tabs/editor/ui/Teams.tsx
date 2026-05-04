import React, { useState, useEffect } from "react";
import { Pressable, View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "@/src/ui/Text";
import { TextField } from "@/src/ui/TextField";
import { Icon } from "@/src/ui/Icon";
import { colors } from "@/src/theme/colors";
import { UITeam, UICategory } from "@/src/host/game/components/tabs/editor/types";
import { Button } from "@/src/ui/Button";
import {Ionicons} from "@expo/vector-icons";
import { mixpanel } from "@/src/analytics/mixpanel";

export function TeamsSection({
                                 teams,
                                 categories,
                                 onAdd,
                                 onRemove,
                                 onUpdate
                             }: {
    teams: UITeam[];
    categories: UICategory[];
    onAdd: (name: string, code: string, categoryId: number) => void;
    onRemove: (t: UITeam) => void;
    onUpdate: (t: UITeam, name: string, code: string, categoryId: number) => void;
}) {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
    const [editingTeam, setEditingTeam] = useState<UITeam | null>(null);

    const validCategories = categories.filter(c => c.id != null);

    useEffect(() => {
        if (!selectedCatId && validCategories.length > 0) {
            setSelectedCatId(validCategories[0].id!);
        }
    }, [categories, selectedCatId, validCategories]);

    const isReadyToAdd = name.trim().length > 0 && code.trim().length > 0 && selectedCatId !== null;

    const handleSave = () => {
        if (!isReadyToAdd) return;
        if (editingTeam) {
            onUpdate(editingTeam, name, code, selectedCatId!);
            setEditingTeam(null);
        } else {
            onAdd(name, code, selectedCatId!);
        }
        setName("");
        setCode("");
    };

    const handleEdit = (team: any) => {
        setEditingTeam(team);
        setName(team.name);
        setCode(team.team_code || "");
        setSelectedCatId(team.category_id || team.categoryId);
    };

    const handleCancel = () => {
        setEditingTeam(null);
        setName("");
        setCode("");
    };

    return (
        <View style={{ gap: 10 }}>
            <Text variant="h3">{t("hostEditorTeams.title")}</Text>

            <View style={{ gap: 10 }}>
                <Text variant="captionM" style={{ color: colors.neutralDark.medium }}>{t("hostEditorTeams.categoryLabel")}</Text>

                {validCategories.length === 0 ? (
                    <Text variant="bodyM" style={{ color: colors.warning.dark }}>
                        {t("hostEditorTeams.needCategories")}
                    </Text>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {validCategories.map(c => {
                            const isActive = selectedCatId === c.id;
                            return (
                                <TouchableOpacity
                                    key={c.id}
                                    onPress={() => {
                                        void mixpanel.track("Host Editor Team Category Selected", {
                                            category_id: c.id ?? null,
                                            previous_category_id: selectedCatId,
                                            is_editing: Boolean(editingTeam),
                                        });
                                        setSelectedCatId(c.id!);
                                    }}
                                    style={[styles.catChip, isActive && styles.catChipActive]}
                                >
                                    <Text style={{
                                        color: isActive ? '#fff' : colors.neutralDark.medium,
                                        fontWeight: isActive ? 'bold' : 'normal'
                                    }}>
                                        {c.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}

                        {categories.some(c => c.id == null) && (
                            <View style={[styles.catChip, { backgroundColor: 'transparent', borderColor: colors.neutralLight.medium, borderStyle: 'dashed' }]}>
                                <Text style={{ color: colors.neutralDark.light, fontSize: 12 }}>
                                    {t("hostEditorTeams.saveToUseCategories")}
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                )}

                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <TextField value={name} placeholder={t("hostEditorTeams.teamNamePlaceholder")} onChangeText={setName} />
                    </View>

                    <View style={{ flex: 1 }}>
                        <TextField value={code} placeholder={t("hostEditorTeams.teamCodePlaceholder")} onChangeText={setCode} />
                    </View>

                    <View style={{ flexDirection: "row", gap: 8, alignSelf: "center" }}>
                        {editingTeam && (
                            <Button title={t("hostEditorTeams.cancel")} variant="secondary" onPress={handleCancel} />
                        )}
                        <Button
                            title={editingTeam ? t("hostEditorTeams.save") : t("hostEditorTeams.add")}
                            variant={editingTeam ? "primary" : "secondary"}
                            onPress={handleSave}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {teams.map((t: any) => {
                        const actualCategoryId = t.category_id || t.categoryId;
                        const catName = categories.find(c => c.id != null && c.id === actualCategoryId)?.name;
                        const displayText = catName ? `${t.name} (${catName})` : t.name;

                        return (
                            <View
                                key={t.id ? `team_${t.id}` : t._tmpId!}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor: colors.highlight.lightest,
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 100,
                                    gap: 6
                                }}
                            >
                                <Pressable onPress={() => handleEdit(t)} hitSlop={10}>
                                    <Ionicons name="pencil" size={12} color={colors.highlight.darkest} />
                                </Pressable>

                                <Text style={{
                                    color: colors.highlight.darkest,
                                    fontWeight: 'normal',
                                    fontSize: 12
                                }}>
                                    {displayText}
                                </Text>

                                <Pressable onPress={() => onRemove(t)} hitSlop={10}>
                                    <View style={{
                                        backgroundColor: colors.neutralDark.light,
                                        width: 16,
                                        height: 16,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon name="x" size={10} color="#fff" />
                                    </View>
                                </Pressable>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    catChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.neutralLight.medium,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        justifyContent: 'center'
    },
    catChipActive: {
        backgroundColor: colors.highlight.darkest,
        borderColor: colors.highlight.darkest,
    }
});