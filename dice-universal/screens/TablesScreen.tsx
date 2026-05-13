import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useDb } from "../data/db/DbProvider";
import { useActiveTable } from "../data/state/ActiveTableProvider";
import {
  listTables,
  getTableStats,
  TableRow,
  TableStats,
  deleteTable,
  createTable,
} from "../data/repositories/tablesRepo";

import { arcane } from "../theme/arcaneTheme";
import { useArcaneLayout } from "../theme/useArcaneLayout";
import { arcaneStyles } from "../theme/arcaneStyles";

type TableListItem = {
  table: TableRow;
  stats: TableStats;
};

export default function TablesScreen() {
  const layout = useArcaneLayout();

  const db = useDb();
  const router = useRouter();
  const { setActiveTableId, activeTableId, clearActiveTableId } =
    useActiveTable();

  const [tables, setTables] = useState<TableListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function loadTables() {
    const rows = await listTables(db);
    const enriched: TableListItem[] = [];
    for (const table of rows) {
      const stats = await getTableStats(db, table.id);
      enriched.push({ table, stats });
    }

    setTables(enriched);
  }

  async function handleDeleteTable(tableId: string) {
    try {
      setError(null);

      await deleteTable(db, tableId);

      if (activeTableId === tableId) {
        await clearActiveTableId();
      }

      await loadTables();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  async function handleCreateTable() {
    const name = newTableName.trim();

    if (!name || isCreating) return;

    try {
      setError(null);
      setIsCreating(true);

      const createdId = await createTable(db, {
        name,
        is_system: 0,
      });

      setNewTableName("");
      setShowCreateModal(false);

      await loadTables();
      await setActiveTableId(createdId);
      router.push(`/tables/${createdId}` as any);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setIsCreating(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        try {
          setError(null);

          const rows = await listTables(db);
          const enriched: TableListItem[] = [];
          for (const table of rows) {
            const stats = await getTableStats(db, table.id);
            enriched.push({ table, stats });
          }

          if (isActive) {
            setTables(enriched);
          }
        } catch (e: any) {
          if (isActive) {
            setError(e?.message ?? String(e));
          }
        }
      })();

      return () => {
        isActive = false;
      };
    }, [db]),
  );

  const activeTable =
    tables.find((item) => item.table.id === activeTableId) ?? null;

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

          <Text style={[arcaneStyles.muted, { marginTop: arcane.spacing.sm }]}>
            {error}
          </Text>

          <Pressable
            onPress={() => setError(null)}
            style={{
              marginTop: arcane.spacing.md,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: arcane.colors.border,
              borderRadius: arcane.radius.md,
              alignSelf: "flex-start",
              backgroundColor: arcane.colors.surfaceAlt,
            }}
          >
            <Text style={{ color: arcane.colors.text, fontWeight: "800" }}>
              Fermer
            </Text>
          </Pressable>
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
        }}
      >
        <View style={{ gap: arcane.spacing.xs }}>
          <Text
            style={{
              color: arcane.colors.text,
              fontSize: 28,
              fontWeight: "900",
              letterSpacing: -0.4,
            }}
          >
            Tables
          </Text>

          <Text style={arcaneStyles.muted}>
            Organise tes univers, profils et actions sauvegardées.
          </Text>
        </View>

        <View
          style={{
            ...arcaneStyles.card,
            marginTop: arcane.spacing.md,
            gap: arcane.spacing.sm,
          }}
        >
          <Text
            style={{
              color: arcane.colors.textSubtle,
              fontSize: arcane.typography.tiny,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Table active
          </Text>

          {activeTable ? (
            <>
              <Text
                style={{
                  color: arcane.colors.text,
                  fontSize: 20,
                  fontWeight: "900",
                }}
              >
                {activeTable.table.name}
              </Text>

              <Text style={arcaneStyles.muted}>
                Cette table alimente l’écran Jet avec ses profils et actions.
              </Text>

              <Pressable
                onPress={async () => {
                  await clearActiveTableId();
                }}
                style={{
                  marginTop: arcane.spacing.xs,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: arcane.colors.border,
                  borderRadius: arcane.radius.md,
                  alignSelf: "flex-start",
                  backgroundColor: arcane.colors.surfaceAlt,
                }}
              >
                <Text style={{ color: arcane.colors.text, fontWeight: "800" }}>
                  Retirer la table active
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text
                style={{
                  color: arcane.colors.text,
                  fontSize: 20,
                  fontWeight: "900",
                }}
              >
                Aucune table active
              </Text>

              <Text style={arcaneStyles.muted}>
                Active une table pour afficher ses actions dans l’écran Jet.
              </Text>
            </>
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: arcane.spacing.sm,
            marginTop: arcane.spacing.md,
          }}
        >
          <Pressable
            onPress={() => setShowCreateModal(true)}
            style={({ pressed }) => ({
              flex: 1,
              padding: arcane.spacing.md,
              borderWidth: 1,
              borderColor: arcane.colors.accent,
              borderRadius: arcane.radius.lg,
              backgroundColor: arcane.colors.accentSoft,
              opacity: pressed ? 0.84 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text style={{ color: arcane.colors.text, fontWeight: "900" }}>
              Créer une table
            </Text>
            <Text style={{ marginTop: 4, color: arcane.colors.textMuted }}>
              Nouvelle table perso.
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/rules" as any)}
            style={({ pressed }) => ({
              flex: 1,
              padding: arcane.spacing.md,
              borderWidth: 1,
              borderColor: arcane.colors.border,
              borderRadius: arcane.radius.lg,
              backgroundColor: arcane.colors.surfaceAlt,
              opacity: pressed ? 0.84 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text style={{ color: arcane.colors.text, fontWeight: "900" }}>
              Règles
            </Text>
            <Text style={{ marginTop: 4, color: arcane.colors.textMuted }}>
              Atelier avancé.
            </Text>
          </Pressable>
        </View>

        {tables.length === 0 ? (
          <View
            style={{
              ...arcaneStyles.card,
              marginTop: arcane.spacing.md,
              gap: arcane.spacing.sm,
            }}
          >
            <Text
              style={{
                color: arcane.colors.text,
                fontSize: 18,
                fontWeight: "900",
              }}
            >
              Aucune table disponible
            </Text>

            <Text style={arcaneStyles.muted}>
              Crée ta première table personnalisée.
            </Text>
          </View>
        ) : (
          <FlatList
            style={{
              marginTop: 16,
              flex: 1,
            }}
            contentContainerStyle={{
              paddingBottom: 32,
            }}
            data={tables}
            keyExtractor={(item) => item.table.id}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => {
              const { table, stats } = item;
              const isActive = activeTableId === table.id;

              return (
                <Pressable
                  onPress={() => {
                    router.push(`/tables/${table.id}` as any);
                  }}
                  style={({ pressed }) => ({
                    ...arcaneStyles.card,
                    gap: arcane.spacing.sm,
                    borderColor: isActive
                      ? arcane.colors.accent
                      : arcane.colors.border,
                    backgroundColor: isActive
                      ? arcane.colors.accentSoft
                      : arcane.colors.backgroundElevated,
                    opacity: pressed ? 0.88 : 1,
                    transform: [{ scale: pressed ? 0.99 : 1 }],
                  })}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: arcane.spacing.sm,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: arcane.colors.text,
                          fontSize: 18,
                          fontWeight: "900",
                        }}
                      >
                        {table.name}
                      </Text>

                      <Text
                        style={{
                          marginTop: 4,
                          color: arcane.colors.textMuted,
                          fontWeight: "600",
                        }}
                      >
                        {table.is_system === 1
                          ? "Table système"
                          : "Table perso"}
                      </Text>
                    </View>

                    {isActive ? (
                      <View
                        style={{
                          paddingVertical: 5,
                          paddingHorizontal: 10,
                          borderWidth: 1,
                          borderColor: arcane.colors.accent,
                          borderRadius: arcane.radius.pill,
                          backgroundColor: arcane.colors.accentSoft,
                        }}
                      >
                        <Text
                          style={{
                            color: arcane.colors.text,
                            fontWeight: "900",
                          }}
                        >
                          Active
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: arcane.spacing.sm,
                    }}
                  >
                    <Text style={{ color: arcane.colors.textMuted }}>
                      {stats.profile_count} profil
                      {stats.profile_count > 1 ? "s" : ""}
                    </Text>

                    <Text style={{ color: arcane.colors.textMuted }}>
                      {stats.group_count} action
                      {stats.group_count > 1 ? "s" : ""}
                    </Text>

                    <Text style={{ color: arcane.colors.textMuted }}>
                      {stats.die_count} entrée{stats.die_count > 1 ? "s" : ""}
                    </Text>
                  </View>

                  <Text style={{ color: arcane.colors.textSubtle }}>
                    Appuyer pour gérer les profils et actions
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: arcane.spacing.sm,
                      marginTop: arcane.spacing.xs,
                    }}
                  >
                    <Pressable
                      onPress={async () => {
                        await setActiveTableId(table.id);
                      }}
                      disabled={isActive}
                      style={({ pressed }) => ({
                        paddingVertical: 9,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderColor: isActive
                          ? arcane.colors.accent
                          : arcane.colors.border,
                        borderRadius: arcane.radius.pill,
                        backgroundColor: isActive
                          ? arcane.colors.accentSoft
                          : arcane.colors.surfaceAlt,
                        opacity: isActive ? 0.65 : pressed ? 0.82 : 1,
                      })}
                    >
                      <Text
                        style={{
                          color: arcane.colors.text,
                          fontWeight: "900",
                        }}
                      >
                        {isActive ? "Déjà active" : "Activer"}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        router.push(`/tables/${table.id}` as any);
                      }}
                      style={({ pressed }) => ({
                        paddingVertical: 9,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderColor: arcane.colors.border,
                        borderRadius: arcane.radius.pill,
                        backgroundColor: arcane.colors.surfaceAlt,
                        opacity: pressed ? 0.82 : 1,
                      })}
                    >
                      <Text
                        style={{
                          color: arcane.colors.text,
                          fontWeight: "900",
                        }}
                      >
                        Ouvrir
                      </Text>
                    </Pressable>

                    {table.is_system !== 1 ? (
                      <Pressable
                        onPress={() => handleDeleteTable(table.id)}
                        style={({ pressed }) => ({
                          paddingVertical: 9,
                          paddingHorizontal: 12,
                          borderWidth: 1,
                          borderColor: arcane.colors.failure,
                          borderRadius: arcane.radius.pill,
                          backgroundColor: arcane.colors.failureSoft,
                          opacity: pressed ? 0.82 : 1,
                        })}
                      >
                        <Text
                          style={{
                            color: arcane.colors.text,
                            fontWeight: "900",
                          }}
                        >
                          Supprimer
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </Pressable>
              );
            }}
          />
        )}

        <Modal
          visible={showCreateModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (!isCreating) {
              setShowCreateModal(false);
            }
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.68)",
              justifyContent: "center",
              padding: arcane.spacing.md,
            }}
          >
            <View
              style={{
                ...arcaneStyles.card,
                gap: arcane.spacing.md,
                borderColor: arcane.colors.accent,
              }}
            >
              <View style={{ gap: arcane.spacing.xs }}>
                <Text
                  style={{
                    color: arcane.colors.textSubtle,
                    fontSize: arcane.typography.tiny,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  Nouvelle table
                </Text>

                <Text
                  style={{
                    color: arcane.colors.text,
                    fontSize: 22,
                    fontWeight: "900",
                  }}
                >
                  Créer une table
                </Text>

                <Text style={arcaneStyles.muted}>
                  Une table regroupe un univers, ses profils, ses actions et ses
                  règles de lancer.
                </Text>
              </View>

              <View style={{ gap: arcane.spacing.xs }}>
                <Text
                  style={{
                    color: arcane.colors.text,
                    fontWeight: "800",
                  }}
                >
                  Nom de la table
                </Text>

                <TextInput
                  value={newTableName}
                  onChangeText={setNewTableName}
                  placeholder="Ex: Campagne principale"
                  placeholderTextColor={arcane.colors.textMuted}
                  selectionColor={arcane.colors.accent}
                  editable={!isCreating}
                  style={{
                    minHeight: 48,
                    borderWidth: 1,
                    borderColor: arcane.colors.border,
                    borderRadius: arcane.radius.md,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: arcane.colors.surfaceAlt,
                    color: arcane.colors.text,
                    fontSize: 16,
                    fontWeight: "700",
                    opacity: isCreating ? 0.6 : 1,
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  gap: arcane.spacing.sm,
                }}
              >
                <Pressable
                  onPress={() => {
                    if (!isCreating) {
                      setShowCreateModal(false);
                      setNewTableName("");
                    }
                  }}
                  disabled={isCreating}
                  style={({ pressed }) => ({
                    paddingVertical: 11,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderColor: arcane.colors.border,
                    borderRadius: arcane.radius.pill,
                    backgroundColor: arcane.colors.surfaceAlt,
                    opacity: isCreating ? 0.5 : pressed ? 0.84 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}
                >
                  <Text
                    style={{
                      color: arcane.colors.text,
                      fontWeight: "900",
                    }}
                  >
                    Annuler
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleCreateTable}
                  disabled={isCreating}
                  style={({ pressed }) => ({
                    paddingVertical: 11,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderColor: arcane.colors.accent,
                    borderRadius: arcane.radius.pill,
                    backgroundColor: arcane.colors.accentSoft,
                    opacity: isCreating ? 0.6 : pressed ? 0.84 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}
                >
                  <Text
                    style={{
                      color: arcane.colors.text,
                      fontWeight: "900",
                    }}
                  >
                    {isCreating ? "Création..." : "Créer"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
