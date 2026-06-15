// dice-universal/features/roll3d/components/Roll3DContextHeader.tsx

import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ContextOption = {
    id: string;
    name: string;
    actionCount?: number;
    is_system?: number;
};

type Roll3DContextHeaderProps = {
    tableName: string | null;
    profileName: string | null;
    tables: ContextOption[];
    profiles: ContextOption[];
    selectedTableId: string | null;
    selectedProfileId: string | null;
    onSelectTable: (tableId: string) => void;
    onSelectProfile: (profileId: string) => void;
};

function ContextChip({
    icon,
    label,
    value,
    disabled,
    onPress,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    disabled?: boolean;
    onPress?: () => void;
}) {
    return (
        <Pressable
            disabled={disabled || !onPress}
            onPress={onPress}
            style={({ pressed }) => ({
                flex: 1,
                opacity: disabled ? 0.58 : pressed ? 0.82 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
            })}
        >
            <View
                style={{
                    minHeight: 46,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: "rgba(232, 200, 120, 0.20)",
                    backgroundColor: "rgba(5, 7, 19, 0.68)",
                    paddingHorizontal: 13,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <View
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(255,255,255,0.045)",
                    }}
                >
                    <Ionicons
                        name={icon}
                        size={15}
                        color={
                            disabled
                                ? "rgba(255,255,255,0.36)"
                                : "rgba(255,255,255,0.78)"
                        }
                    />
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                        numberOfLines={1}
                        style={{
                            color: "rgba(255,255,255,0.48)",
                            fontSize: 9,
                            fontWeight: "800",
                        }}
                    >
                        {label}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={{
                            color: disabled
                                ? "rgba(255,255,255,0.45)"
                                : "rgba(232, 200, 120, 0.94)",
                            fontSize: 12,
                            fontWeight: "900",
                            marginTop: 1,
                        }}
                    >
                        {value}
                    </Text>
                </View>

                <Ionicons
                    name="chevron-down"
                    size={14}
                    color="rgba(255,255,255,0.54)"
                />
            </View>
        </Pressable>
    );
}

function ContextSelectorModal({
    visible,
    title,
    subtitle,
    emptyLabel,
    options,
    selectedId,
    getMeta,
    onClose,
    onSelect,
}: {
    visible: boolean;
    title: string;
    subtitle: string;
    emptyLabel: string;
    options: ContextOption[];
    selectedId: string | null;
    getMeta: (option: ContextOption) => string;
    onClose: () => void;
    onSelect: (id: string) => void;
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <Pressable
                onPress={onClose}
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.66)",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 18,
                    paddingVertical: 28,
                }}
            >
                <Pressable
                    onPress={() => {
                        return;
                    }}
                    style={{
                        width: "100%",
                        maxWidth: 420,
                        maxHeight: "78%",
                        borderRadius: 30,
                        borderWidth: 1,
                        borderColor: "rgba(232, 200, 120, 0.18)",
                        backgroundColor: "rgba(8, 10, 19, 0.97)",
                        padding: 16,
                        gap: 12,
                    }}
                >
                    <View style={{ gap: 5 }}>
                        <Text
                            style={{
                                color: "rgba(232, 200, 120, 0.94)",
                                fontSize: 11,
                                fontWeight: "900",
                                textTransform: "uppercase",
                                letterSpacing: 1.2,
                            }}
                        >
                            {title}
                        </Text>

                        <Text
                            style={{
                                color: "rgba(255,255,255,0.62)",
                                fontSize: 12,
                                fontWeight: "700",
                                lineHeight: 17,
                            }}
                        >
                            {subtitle}
                        </Text>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            gap: 8,
                            paddingBottom: 2,
                        }}
                    >
                        {options.length === 0 ? (
                            <View
                                style={{
                                    borderRadius: 18,
                                    borderWidth: 1,
                                    borderColor: "rgba(255,255,255,0.08)",
                                    backgroundColor: "rgba(255,255,255,0.045)",
                                    padding: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        color: "rgba(255,255,255,0.72)",
                                        fontSize: 12,
                                        fontWeight: "800",
                                        lineHeight: 17,
                                    }}
                                >
                                    {emptyLabel}
                                </Text>
                            </View>
                        ) : (
                            options.map((option) => {
                                const selected = option.id === selectedId;

                                return (
                                    <Pressable
                                        key={`roll-3d-context-option-${title}-${option.id}`}
                                        onPress={() => {
                                            onSelect(option.id);
                                            onClose();
                                        }}
                                        style={({ pressed }) => ({
                                            opacity: pressed ? 0.78 : 1,
                                            transform: [{ scale: pressed ? 0.985 : 1 }],
                                        })}
                                    >
                                        <View
                                            style={{
                                                minHeight: 52,
                                                borderRadius: 19,
                                                borderWidth: 1,
                                                borderColor: selected
                                                    ? "rgba(232, 200, 120, 0.34)"
                                                    : "rgba(255,255,255,0.08)",
                                                backgroundColor: selected
                                                    ? "rgba(232, 200, 120, 0.10)"
                                                    : "rgba(255,255,255,0.045)",
                                                paddingHorizontal: 12,
                                                paddingVertical: 10,
                                                flexDirection: "row",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: 10,
                                            }}
                                        >
                                            <View style={{ flex: 1, minWidth: 0 }}>
                                                <Text
                                                    numberOfLines={1}
                                                    style={{
                                                        color: selected
                                                            ? "rgba(232, 200, 120, 0.96)"
                                                            : "rgba(255,255,255,0.92)",
                                                        fontSize: 13,
                                                        fontWeight: "900",
                                                    }}
                                                >
                                                    {option.name}
                                                </Text>

                                                <Text
                                                    numberOfLines={1}
                                                    style={{
                                                        color: "rgba(255,255,255,0.52)",
                                                        fontSize: 10,
                                                        fontWeight: "800",
                                                        marginTop: 3,
                                                    }}
                                                >
                                                    {getMeta(option)}
                                                </Text>
                                            </View>

                                            {selected ? (
                                                <View
                                                    style={{
                                                        borderRadius: 999,
                                                        borderWidth: 1,
                                                        borderColor: "rgba(232, 200, 120, 0.24)",
                                                        backgroundColor: "rgba(232, 200, 120, 0.08)",
                                                        paddingHorizontal: 8,
                                                        paddingVertical: 5,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: "rgba(232, 200, 120, 0.96)",
                                                            fontSize: 9,
                                                            fontWeight: "900",
                                                            textTransform: "uppercase",
                                                            letterSpacing: 0.6,
                                                        }}
                                                    >
                                                        Actif
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </Pressable>
                                );
                            })
                        )}
                    </ScrollView>

                    <Pressable
                        onPress={onClose}
                        style={({ pressed }) => ({
                            opacity: pressed ? 0.72 : 1,
                        })}
                    >
                        <View
                            style={{
                                minHeight: 42,
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.08)",
                                backgroundColor: "rgba(255,255,255,0.045)",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color: "rgba(255,255,255,0.66)",
                                    fontSize: 12,
                                    fontWeight: "900",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.8,
                                }}
                            >
                                Fermer
                            </Text>
                        </View>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

export function Roll3DContextHeader({
    tableName,
    profileName,
    tables,
    profiles,
    selectedTableId,
    selectedProfileId,
    onSelectTable,
    onSelectProfile,
}: Roll3DContextHeaderProps) {
    const [showTableSelector, setShowTableSelector] = useState(false);
    const [showProfileSelector, setShowProfileSelector] = useState(false);

    return (
        <>
            <View
                pointerEvents="box-none"
                style={{
                    position: "absolute",
                    top: 18,
                    left: 14,
                    right: 14,
                    zIndex: 7,
                    flexDirection: "row",
                    gap: 10,
                }}
            >
                <ContextChip
                    icon="albums-outline"
                    label="Table"
                    value={tableName ?? "Aucune table"}
                    disabled={tables.length === 0}
                    onPress={() => setShowTableSelector(true)}
                />

                <ContextChip
                    icon="person-outline"
                    label="Profil"
                    value={profileName ?? "Aucun profil"}
                    disabled={profiles.length === 0}
                    onPress={() => setShowProfileSelector(true)}
                />
            </View>

            <ContextSelectorModal
                visible={showTableSelector}
                title="Table active"
                subtitle="Choisis le contexte de règles utilisé pour cette table de lancer."
                emptyLabel="Aucune table disponible."
                options={tables}
                selectedId={selectedTableId}
                getMeta={(table) =>
                    table.is_system === 1 ? "Table système" : "Table utilisateur"
                }
                onClose={() => setShowTableSelector(false)}
                onSelect={onSelectTable}
            />

            <ContextSelectorModal
                visible={showProfileSelector}
                title="Profil actif"
                subtitle="Choisis le personnage ou profil dont les jets préparés seront affichés."
                emptyLabel="Aucun profil disponible pour cette table."
                options={profiles}
                selectedId={selectedProfileId}
                getMeta={(profile) =>
                    typeof profile.actionCount === "number"
                        ? `${profile.actionCount} action${profile.actionCount > 1 ? "s" : ""}`
                        : "Profil disponible"
                }
                onClose={() => setShowProfileSelector(false)}
                onSelect={onSelectProfile}
            />
        </>
    );
}