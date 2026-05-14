// dice-universal/screens/HistoryScreen.tsx

import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { useDb } from "../data/db/DbProvider";
import {
  deleteAllRollEvents,
  listRecentRollEvents,
  type RollEventRow,
} from "../data/repositories/rollEventsRepo";

import { useArcaneLayout } from "../theme/useArcaneLayout";
import { useArcaneTheme } from "../theme/ArcaneThemeProvider";

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
  const { theme } = useArcaneTheme();
  const isDanger = variant === "danger";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: isDanger ? theme.colors.failure : theme.colors.border,
        borderRadius: theme.radius.pill,
        backgroundColor: isDanger
          ? theme.colors.failureSoft
          : theme.colors.surfaceAlt,
        opacity: disabled ? 0.45 : pressed ? 0.84 : 1,
        transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function HistoryCard({ item }: { item: RollEventRow }) {
  const { theme, styles } = useArcaneTheme();

  const summary = parseSummary(item.summary_json);
  const lines = summary.lines ?? [];

  return (
    <View
      style={{
        ...styles.cardSoft,
        gap: theme.spacing.sm,
      }}
    >
      <View style={{ gap: theme.spacing.xs }}>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 17,
            fontWeight: "900",
          }}
        >
          {summary.title ?? "Jet"}
        </Text>

        <Text
          style={{
            color: theme.colors.textSubtle,
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
            borderColor: theme.colors.border,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.surfaceAlt,
          }}
        >
          <Text
            style={{
              color: theme.colors.textMuted,
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
                color: theme.colors.textMuted,
                lineHeight: 20,
                fontWeight: "700",
              }}
            >
              • {line}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.muted}>
          Aucun détail lisible enregistré pour ce jet.
        </Text>
      )}
    </View>
  );
}

function EmptyHistoryCard() {
  const { theme, styles } = useArcaneTheme();

  return (
    <View
      style={{
        ...styles.cardSoft,
        gap: theme.spacing.xs,
        marginTop: theme.spacing.sm,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: "900",
        }}
      >
        Aucun jet enregistré
      </Text>

      <Text style={styles.muted}>
        Lance un jet depuis l’écran Jet : il apparaîtra ici automatiquement.
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const db = useDb();
  const layout = useArcaneLayout();
  const { theme, styles } = useArcaneTheme();

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
          styles.screen,
          {
            paddingTop: layout.insets.top + theme.spacing.lg,
            paddingHorizontal: layout.horizontalPadding,
            justifyContent: "center",
          },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Erreur</Text>

          <Text
            style={[
              styles.muted,
              {
                marginTop: theme.spacing.sm,
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
    <View style={styles.screen}>
      <View
        style={{
          flex: 1,
          paddingTop: layout.insets.top + theme.spacing.md,
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: layout.insets.bottom + theme.spacing.md,
          alignSelf: "center",
          width: "100%",
          maxWidth: layout.maxContentWidth,
          gap: theme.spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: theme.spacing.md,
          }}
        >
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 28,
                fontWeight: "900",
                letterSpacing: -0.4,
              }}
            >
              Historique
            </Text>

            <Text style={styles.muted}>
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
            gap: theme.spacing.sm,
            paddingBottom: theme.spacing.xl,
          }}
          renderItem={({ item }) => <HistoryCard item={item} />}
          ListEmptyComponent={<EmptyHistoryCard />}
          showsVerticalScrollIndicator
        />
      </View>
    </View>
  );
}
