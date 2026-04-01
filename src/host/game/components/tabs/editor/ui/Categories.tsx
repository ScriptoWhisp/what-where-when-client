import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/src/ui/Text";
import { TextField } from "@/src/ui/TextField";
import { Icon } from "@/src/ui/Icon";
import { colors } from "@/src/theme/colors";
import { UICategory } from "@/src/host/game/components/tabs/editor/types";
import { Button } from "@/src/ui/Button";
import {Ionicons} from "@expo/vector-icons";

export function CategoriesSection({
                                      categories,
                                      onAdd,
                                      onRemove,
                                      onUpdate,
                                  }: {
    categories: UICategory[];
    onAdd: (name: string, description?: string) => void;
    onRemove: (c: UICategory) => void;
    onUpdate: (c: UICategory, name: string, description?: string) => void;
}) {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [editingCat, setEditingCat] = useState<UICategory | null>(null);

    const handleSave = () => {
        if (editingCat) {
            onUpdate(editingCat, name, desc);
            setEditingCat(null);
        } else {
            onAdd(name, desc);
        }
        setName("");
        setDesc("");
    };

    const handleEdit = (cat: UICategory) => {
        setEditingCat(cat);
        setName(cat.name);
        setDesc(cat.description || "");
    };

    const handleCancel = () => {
        setEditingCat(null);
        setName("");
        setDesc("");
    };

    return (
        <View style={{ gap: 10 }}>
            <Text variant="h3">Категории</Text>

            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
                <View style={{ flex: 1 }}>
                    <TextField value={name} placeholder="Название категории" onChangeText={setName} />
                </View>
                <View style={{ flex: 1 }}>
                    <TextField value={desc} placeholder="Описание (необязательно)" onChangeText={setDesc} />
                </View>
                <View style={{ flexDirection: "row", gap: 8, alignSelf: "center" }}>
                    {editingCat && (
                        <Button title="Отмена" variant="secondary" onPress={handleCancel} />
                    )}
                    <Button
                        title={editingCat ? "Сохранить" : "Добавить"}
                        variant={editingCat ? "primary" : "secondary"}
                        onPress={handleSave}
                    />
                </View>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {categories.map((t) => (
                    <View
                        key={t.id ? `cat_${t.id}` : t._tmpId!}
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
                            {t.name.toUpperCase()}
                        </Text>

                        {/* Крестик удаления */}
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
                ))}
            </View>
        </View>
    );
}