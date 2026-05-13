// dice-universal\screens\HistoryScreen.tsx

import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { useDb } from "../data/db/DbProvider";
import {
  deleteAllRollEvents,
  listRecentRollEvents,
  type RollEventRow,
} from "../data/repositories/rollEventsRepo";

import { arcane } from "../theme/arcaneTheme";
import { arcaneStyles } from "../theme/arcaneStyles";
import { useArcaneLayout } from "../theme/useArcaneLayout";

type Summary = {
  title?: string;
  lines?: string[];
};

function parseSummary(summaryJson: string): Summary {
  try {
    const parsed = JSON.parse(summaryJson);

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return {
      title:
        typeof parsed.title === "string" && parsed.title.trim()
          ? parsed.title
          : undefined,
      lines: Array.isArray(parsed.lines)
        ? parsed.lines
            .map((line: unknown) => String(line))
            .filter((line: string) => line.trim().length > 0)
        : [],
    };
  } catch {
    return {};
  }
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PillButton({
  label,
  onPress,
  variant = "default",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}) {
  const isDanger = variant === "danger";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: isDanger ? arcane.colors.failure : arcane.colors.border,
        borderRadius: arcane.radius.pill,
        backgroundColor: isDanger
          ? arcane.colors.failureSoft
          : arcane.colors.surfaceAlt,
        opacity: disabled ? 0.45 : pressed ? 0.84 : 1,
        transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function HistoryCard({ item }: { item: RollEventRow }) {
  const summary = parseSummary(item.summary_json);
  const lines = summary.lines ?? [];

  return (
    <View
      style={{
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.sm,
      }}
    >
      <View style={{ gap: arcane.spacing.xs }}>
        <Text
          style={{
            color: arcane.colors.text,
            fontSize: 17,
            fontWeight: "900",
          }}
        >
          {summary.title ?? "Jet"}
        </Text>

        <Text
          style={{
            color: arcane.colors.textSubtle,
            fontWeight: "800",
          }}
        >
          {formatDate(item.created_at)}
        </Text>
      </View>

      {item.table_id ? (
        <View
          style={{
            alignSelf: "flex-start",
            paddingVertical: 5,
            paddingHorizontal: 9,
            borderWidth: 1,
            borderColor: arcane.colors.border,
            borderRadius: arcane.radius.pill,
            backgroundColor: arcane.colors.surfaceAlt,
          }}
        >
          <Text
            style={{
              color: arcane.colors.textMuted,
              fontSize: 12,
              fontWeight: "900",
            }}
          >
            Table liée
          </Text>
        </View>
      ) : null}

      {lines.length > 0 ? (
        <View style={{ gap: 6 }}>
          {lines.map((line, index) => (
            <Text
              key={`${item.id}-line-${index}`}
              style={{
                color: arcane.colors.textMuted,
                lineHeight: 20,
                fontWeight: "700",
              }}
            >
              • {line}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={arcaneStyles.muted}>
          Aucun détail lisible enregistré pour ce jet.
        </Text>
      )}
    </View>
  );
}

function EmptyHistoryCard() {
  return (
    <View
      style={{
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.xs,
        marginTop: arcane.spacing.sm,
      }}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontWeight: "900",
        }}
      >
        Aucun jet enregistré
      </Text>

      <Text style={arcaneStyles.muted}>
        Lance un jet depuis l’écran Jet : il apparaîtra ici automatiquement.
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const db = useDb();
  const layout = useArcaneLayout();

  const [rows, setRows] = useState<RollEventRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const load = useCallback(async () => {
    const recentRows = await listRecentRollEvents(db, 50);
    setRows(recentRows);
  }, [db]);

  useEffect(() => {
    void (async () => {
      try {
        setError(null);
        await load();
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        try {
          setError(null);
          await load();
        } catch (e: any) {
          setError(e?.message ?? String(e));
        }
      })();
    }, [load]),
  );

  async function handleClear() {
    try {
      setIsClearing(true);
      setError(null);
      await deleteAllRollEvents(db);
      await load();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setIsClearing(false);
    }
  }

  if (error) {
    return (
      <View
        style={[
          arcaneStyles.screen,
          {
            paddingTop: layout.insets.top + arcane.spacing.lg,
            paddingHorizontal: layout.horizontalPadding,
            justifyContent: "center",
          },
        ]}
      >
        <View style={arcaneStyles.card}>
          <Text style={arcaneStyles.sectionTitle}>Erreur</Text>

          <Text
            style={[
              arcaneStyles.muted,
              {
                marginTop: arcane.spacing.sm,
              },
            ]}
          >
            {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={arcaneStyles.screen}>
      <View
        style={{
          flex: 1,
          paddingTop: layout.insets.top + arcane.spacing.md,
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: layout.insets.bottom + arcane.spacing.md,
          alignSelf: "center",
          width: "100%",
          maxWidth: layout.maxContentWidth,
          gap: arcane.spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: arcane.spacing.md,
          }}
        >
          <View style={{ flex: 1, gap: arcane.spacing.xs }}>
            <Text
              style={{
                color: arcane.colors.text,
                fontSize: 28,
                fontWeight: "900",
                letterSpacing: -0.4,
              }}
            >
              Historique
            </Text>

            <Text style={arcaneStyles.muted}>
              Consulte les derniers jets lancés pendant tes sessions.
            </Text>
          </View>

          <PillButton
            label={isClearing ? "Suppression..." : "Vider"}
            onPress={handleClear}
            variant="danger"
            disabled={rows.length === 0 || isClearing}
          />
        </View>

        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            gap: arcane.spacing.sm,
            paddingBottom: arcane.spacing.xl,
          }}
          renderItem={({ item }) => <HistoryCard item={item} />}
          ListEmptyComponent={<EmptyHistoryCard />}
          showsVerticalScrollIndicator
        />
      </View>
    </View>
  );
}
