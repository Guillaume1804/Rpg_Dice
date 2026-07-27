// dice-universal/features/roll3d/components/Roll3DCurrentHandSplitModal.tsx

import { useEffect, useMemo, useState } from "react";
import {
    Keyboard,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DSavableDraftLine } from "../logic/roll3DDraft";

type Roll3DCurrentHandSplitModalProps = {
    visible: boolean;
    activeLine: Roll3DSavableDraftLine | null;
    onClose: () => void;
    onApply: (quantities: number[]) => void;
};

function formatQuantities(quantities: number[], sides: number) {
    return quantities
        .map((quantity) => `${quantity}d${sides}`)
        .join(" + ");
}

function SplitChoiceButton({
    title,
    description,
    preview,
    disabled,
    onPress,
}: {
    title: string;
    description: string;
    preview: string;
    disabled?: boolean;
    onPress: () => void;
}) {
    const premium = usePremiumTheme();

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => ({
                opacity: disabled ? 0.38 : pressed ? 0.76 : 1,
                transform: [
                    {
                        scale:
                            pressed && !disabled
                                ? premium.animation.pressScale
                                : 1,
                    },
                ],
            })}
        >
            <View
                style={{
                    minHeight: 68,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: disabled
                        ? premium.colors.border.subtle
                        : "rgba(126, 170, 255, 0.22)",
                    backgroundColor: disabled
                        ? "rgba(255,255,255,0.025)"
                        : "rgba(126, 170, 255, 0.07)",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                }}
            >
                <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                        style={{
                            color: disabled
                                ? premium.colors.text.muted
                                : premium.colors.text.primary,
                            fontSize: 13,
                            fontWeight: "900",
                        }}
                    >
                        {title}
                    </Text>

                    <Text
                        style={{
                            color: premium.colors.text.muted,
                            fontSize: 10,
                            fontWeight: "700",
                            lineHeight: 15,
                            marginTop: 3,
                        }}
                    >
                        {description}
                    </Text>
                </View>

                <View
                    style={{
                        borderRadius: premium.radius.pill,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.08)",
                        backgroundColor: "rgba(255,255,255,0.045)",
                        paddingHorizontal: 9,
                        paddingVertical: 6,
                    }}
                >
                    <Text
                        style={{
                            color: disabled
                                ? premium.colors.text.muted
                                : "rgba(154, 190, 255, 0.96)",
                            fontSize: 10,
                            fontWeight: "900",
                        }}
                    >
                        {preview}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
}

export function Roll3DCurrentHandSplitModal({
    visible,
    activeLine,
    onClose,
    onApply,
}: Roll3DCurrentHandSplitModalProps) {
    const premium = usePremiumTheme();
    const insets = useSafeAreaInsets();

    const [extractedQuantityText, setExtractedQuantityText] =
        useState("1");

    useEffect(() => {
        if (visible) {
            setExtractedQuantityText("1");
        }
    }, [visible, activeLine?.key]);

    const activeLineQuantity = activeLine?.qty ?? 0;

    const extractedQuantity = useMemo(() => {
        const parsed = Number(extractedQuantityText);

        if (!Number.isFinite(parsed)) {
            return 1;
        }

        return Math.floor(parsed);
    }, [extractedQuantityText]);

    const canExtractCustom =
        activeLineQuantity > 1 &&
        extractedQuantity >= 1 &&
        extractedQuantity < activeLineQuantity;

    const halfFirstQuantity = Math.ceil(activeLineQuantity / 2);
    const halfSecondQuantity = Math.floor(activeLineQuantity / 2);

    if (!activeLine) {
        return null;
    }

    /**
     * TypeScript conserve correctement le type non nullable dans les closures
     * grâce à cette référence stable.
     */
    const stableLine = activeLine;

    function applyExtractedQuantity(quantity: number) {
        if (quantity < 1 || quantity >= stableLine.qty) {
            return;
        }

        Keyboard.dismiss();
        onApply([stableLine.qty - quantity, quantity]);
    }

    function handleSplitHalf() {
        if (halfFirstQuantity <= 0 || halfSecondQuantity <= 0) {
            return;
        }

        Keyboard.dismiss();
        onApply([halfFirstQuantity, halfSecondQuantity]);
    }

    function handleSplitEveryDie() {
        if (stableLine.qty <= 1) {
            return;
        }

        Keyboard.dismiss();
        onApply(Array.from({ length: stableLine.qty }, () => 1));
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <Pressable
                onPress={() => {
                    Keyboard.dismiss();
                    onClose();
                }}
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.66)",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingTop: Math.max(24, insets.top + 14),
                    paddingBottom: Math.max(24, insets.bottom + 14),
                }}
            >
                <Pressable
                    onPress={() => undefined}
                    style={{
                        width: "100%",
                        maxWidth: 430,
                        maxHeight: "90%",
                        borderRadius: 30,
                        borderWidth: 1,
                        borderColor: "rgba(126, 170, 255, 0.20)",
                        backgroundColor: "rgba(6, 8, 18, 0.99)",
                        padding: 15,
                        gap: 13,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 12,
                        }}
                    >
                        <View style={{ flex: 1, minWidth: 0 }}>
                            <Text
                                style={{
                                    color: "rgba(154, 190, 255, 0.96)",
                                    fontSize: 10,
                                    fontWeight: "900",
                                    textTransform: "uppercase",
                                    letterSpacing: 1,
                                }}
                            >
                                Répartition
                            </Text>

                            <Text
                                style={{
                                    color: premium.colors.text.primary,
                                    fontSize: 21,
                                    fontWeight: "900",
                                    marginTop: 4,
                                }}
                            >
                                Répartir {activeLine.qty}d{activeLine.sides}
                            </Text>

                            <Text
                                style={{
                                    color: premium.colors.text.muted,
                                    fontSize: 11,
                                    fontWeight: "700",
                                    lineHeight: 16,
                                    marginTop: 4,
                                }}
                            >
                                Chaque groupe pourra ensuite avoir son propre signe,
                                modificateur et comportement.
                            </Text>
                        </View>

                        <Pressable
                            onPress={() => {
                                Keyboard.dismiss();
                                onClose();
                            }}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.72 : 1,
                            })}
                        >
                            <View
                                style={{
                                    minHeight: 34,
                                    borderRadius: premium.radius.pill,
                                    borderWidth: 1,
                                    borderColor: premium.colors.border.subtle,
                                    backgroundColor: premium.colors.surface.subtle,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    paddingHorizontal: 11,
                                }}
                            >
                                <Text
                                    style={{
                                        color: premium.colors.text.secondary,
                                        fontSize: 9,
                                        fontWeight: "900",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Fermer
                                </Text>
                            </View>
                        </Pressable>
                    </View>

                    <View style={{ gap: 8 }}>
                        <Text
                            style={{
                                color: premium.colors.text.muted,
                                fontSize: 9,
                                fontWeight: "900",
                                textTransform: "uppercase",
                                letterSpacing: 0.8,
                            }}
                        >
                            Actions rapides
                        </Text>

                        <SplitChoiceButton
                            title="Isoler un dé"
                            description="Sépare un seul dé du reste de la ligne."
                            preview={formatQuantities(
                                [activeLine.qty - 1, 1],
                                activeLine.sides,
                            )}
                            disabled={activeLine.qty <= 1}
                            onPress={() => applyExtractedQuantity(1)}
                        />

                        <SplitChoiceButton
                            title="Couper en deux"
                            description="Crée deux groupes aussi équilibrés que possible."
                            preview={formatQuantities(
                                [halfFirstQuantity, halfSecondQuantity],
                                activeLine.sides,
                            )}
                            disabled={activeLine.qty <= 1}
                            onPress={handleSplitHalf}
                        />

                        <SplitChoiceButton
                            title="Un dé par ligne"
                            description="Chaque dé devient une ligne indépendante."
                            preview={`${activeLine.qty} lignes de 1d${activeLine.sides}`}
                            disabled={activeLine.qty <= 1}
                            onPress={handleSplitEveryDie}
                        />
                    </View>

                    <View
                        style={{
                            borderRadius: 22,
                            borderWidth: 1,
                            borderColor: "rgba(255,255,255,0.07)",
                            backgroundColor: "rgba(255,255,255,0.035)",
                            padding: 12,
                            gap: 9,
                        }}
                    >
                        <Text
                            style={{
                                color: premium.colors.text.primary,
                                fontSize: 13,
                                fontWeight: "900",
                            }}
                        >
                            Extraire une quantité
                        </Text>

                        <Text
                            style={{
                                color: premium.colors.text.muted,
                                fontSize: 10,
                                fontWeight: "700",
                                lineHeight: 15,
                            }}
                        >
                            Choisis combien de dés doivent former le nouveau groupe.
                        </Text>

                        <TextInput
                            value={extractedQuantityText}
                            onChangeText={setExtractedQuantityText}
                            keyboardType="number-pad"
                            inputMode="numeric"
                            returnKeyType="done"
                            blurOnSubmit
                            onSubmitEditing={Keyboard.dismiss}
                            placeholder="Ex. 2"
                            placeholderTextColor="rgba(255,255,255,0.28)"
                            style={{
                                minHeight: 44,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: canExtractCustom
                                    ? "rgba(126, 170, 255, 0.24)"
                                    : "rgba(255,255,255,0.09)",
                                backgroundColor: "rgba(0,0,0,0.22)",
                                color: premium.colors.text.primary,
                                paddingHorizontal: 13,
                                fontSize: 13,
                                fontWeight: "900",
                            }}
                        />

                        <Pressable
                            onPress={Keyboard.dismiss}
                            style={({ pressed }) => ({
                                alignSelf: "flex-end",
                                opacity: pressed ? 0.7 : 1,
                            })}
                        >
                            <View
                                style={{
                                    minHeight: 32,
                                    borderRadius: premium.radius.pill,
                                    borderWidth: 1,
                                    borderColor: premium.colors.border.subtle,
                                    backgroundColor: premium.colors.surface.subtle,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    paddingHorizontal: 11,
                                }}
                            >
                                <Text
                                    style={{
                                        color: premium.colors.text.secondary,
                                        fontSize: 9,
                                        fontWeight: "900",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.6,
                                    }}
                                >
                                    Masquer le clavier
                                </Text>
                            </View>
                        </Pressable>

                        <Text
                            style={{
                                color: canExtractCustom
                                    ? "rgba(154, 190, 255, 0.96)"
                                    : premium.colors.text.muted,
                                fontSize: 10,
                                fontWeight: "800",
                            }}
                        >
                            {canExtractCustom
                                ? formatQuantities(
                                    [
                                        activeLine.qty - extractedQuantity,
                                        extractedQuantity,
                                    ],
                                    activeLine.sides,
                                )
                                : `Entre une valeur de 1 à ${Math.max(
                                    1,
                                    activeLine.qty - 1,
                                )}.`}
                        </Text>

                        <Pressable
                            disabled={!canExtractCustom}
                            onPress={() =>
                                applyExtractedQuantity(extractedQuantity)
                            }
                            style={({ pressed }) => ({
                                opacity: !canExtractCustom
                                    ? 0.38
                                    : pressed
                                        ? 0.76
                                        : 1,
                                transform: [
                                    {
                                        scale:
                                            pressed && canExtractCustom
                                                ? premium.animation.pressScale
                                                : 1,
                                    },
                                ],
                            })}
                        >
                            <View
                                style={{
                                    minHeight: 44,
                                    borderRadius: premium.radius.pill,
                                    borderWidth: 1,
                                    borderColor: "rgba(126, 170, 255, 0.28)",
                                    backgroundColor: "rgba(126, 170, 255, 0.10)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        color: "rgba(154, 190, 255, 0.96)",
                                        fontSize: 11,
                                        fontWeight: "900",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.7,
                                    }}
                                >
                                    Appliquer cette répartition
                                </Text>
                            </View>
                        </Pressable>
                    </View>

                    <View
                        style={{
                            borderRadius: 18,
                            backgroundColor: "rgba(255,255,255,0.04)",
                            paddingHorizontal: 11,
                            paddingVertical: 9,
                        }}
                    >
                        <Text
                            style={{
                                color: premium.colors.text.muted,
                                fontSize: 10,
                                fontWeight: "700",
                                lineHeight: 15,
                            }}
                        >
                            La quantité totale ne change pas. Seule
                            l’organisation logique de la Main est modifiée.
                        </Text>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}