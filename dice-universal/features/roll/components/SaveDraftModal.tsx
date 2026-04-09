import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type SaveMode =
  | "new_table_new_profile"
  | "existing_table_new_profile"
  | "existing_table_existing_profile";

type SaveTargetProfile = {
  id: string;
  name: string;
};

type SaveTargetTable = {
  table: {
    id: string;
    name: string;
    is_system: number;
  };
  profiles: SaveTargetProfile[];
};

type Props = {
  visible: boolean;
  initialTableName: string;
  initialProfileName: string;
  availableTargets: SaveTargetTable[];
  loadingTargets?: boolean;

  onCancel: () => void;
  onConfirm: (params: {
    mode: SaveMode;
    tableName?: string;
    profileName?: string;
    tableId?: string;
    profileId?: string;
  }) => void | Promise<void>;
};

export function SaveDraftModal({
  visible,
  initialTableName,
  initialProfileName,
  availableTargets,
  loadingTargets = false,
  onCancel,
  onConfirm,
}: Props) {
  const [mode, setMode] = useState<SaveMode>("new_table_new_profile");
  const [tableName, setTableName] = useState(initialTableName);
  const [profileName, setProfileName] = useState(initialProfileName);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!visible) return;

    setMode("new_table_new_profile");
    setTableName(initialTableName);
    setProfileName(initialProfileName);

    const firstTable = availableTargets[0]?.table.id ?? null;
    setSelectedTableId(firstTable);

    const firstProfile = availableTargets[0]?.profiles[0]?.id ?? null;
    setSelectedProfileId(firstProfile);
  }, [visible, initialTableName, initialProfileName, availableTargets]);

  const selectedTable = useMemo(
    () =>
      availableTargets.find((entry) => entry.table.id === selectedTableId) ??
      null,
    [availableTargets, selectedTableId],
  );

  useEffect(() => {
    if (!selectedTable) {
      setSelectedProfileId(null);
      return;
    }

    const exists = selectedTable.profiles.some((p) => p.id === selectedProfileId);
    if (!exists) {
      setSelectedProfileId(selectedTable.profiles[0]?.id ?? null);
    }
  }, [selectedTable, selectedProfileId]);

  function handleConfirm() {
    if (mode === "new_table_new_profile") {
      onConfirm({
        mode,
        tableName,
        profileName,
      });
      return;
    }

    if (mode === "existing_table_new_profile") {
      onConfirm({
        mode,
        tableId: selectedTableId ?? undefined,
        profileName,
      });
      return;
    }

    onConfirm({
      mode,
      tableId: selectedTableId ?? undefined,
      profileId: selectedProfileId ?? undefined,
    });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            maxHeight: "90%",
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800" }}>
            Sauvegarder ce jet rapide
          </Text>

          <Text style={{ opacity: 0.72 }}>
            Choisis où enregistrer les actions temporaires actuelles.
          </Text>

          <View style={{ gap: 8 }}>
            <Pressable
              onPress={() => setMode("new_table_new_profile")}
              style={{
                padding: 10,
                borderWidth: 1,
                borderRadius: 10,
                opacity: mode === "new_table_new_profile" ? 1 : 0.7,
              }}
            >
              <Text
                style={{
                  fontWeight: mode === "new_table_new_profile" ? "700" : "400",
                }}
              >
                Nouvelle table + nouveau profil
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode("existing_table_new_profile")}
              style={{
                padding: 10,
                borderWidth: 1,
                borderRadius: 10,
                opacity: mode === "existing_table_new_profile" ? 1 : 0.7,
              }}
            >
              <Text
                style={{
                  fontWeight:
                    mode === "existing_table_new_profile" ? "700" : "400",
                }}
              >
                Table existante + nouveau profil
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode("existing_table_existing_profile")}
              style={{
                padding: 10,
                borderWidth: 1,
                borderRadius: 10,
                opacity:
                  mode === "existing_table_existing_profile" ? 1 : 0.7,
              }}
            >
              <Text
                style={{
                  fontWeight:
                    mode === "existing_table_existing_profile" ? "700" : "400",
                }}
              >
                Table existante + profil existant
              </Text>
            </Pressable>
          </View>

          {mode === "new_table_new_profile" ? (
            <View style={{ gap: 10 }}>
              <View>
                <Text style={{ marginBottom: 6, fontWeight: "700" }}>
                  Nom de la table
                </Text>
                <TextInput
                  value={tableName}
                  onChangeText={setTableName}
                  placeholder="Nom de la table"
                  style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                />
              </View>

              <View>
                <Text style={{ marginBottom: 6, fontWeight: "700" }}>
                  Nom du profil
                </Text>
                <TextInput
                  value={profileName}
                  onChangeText={setProfileName}
                  placeholder="Nom du profil"
                  style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                />
              </View>
            </View>
          ) : null}

          {mode === "existing_table_new_profile" ? (
            <View style={{ gap: 10 }}>
              <View>
                <Text style={{ marginBottom: 6, fontWeight: "700" }}>
                  Table existante
                </Text>

                <ScrollView style={{ maxHeight: 180 }}>
                  <View style={{ gap: 8 }}>
                    {loadingTargets ? (
                      <Text style={{ opacity: 0.72 }}>Chargement…</Text>
                    ) : availableTargets.length === 0 ? (
                      <Text style={{ opacity: 0.72 }}>
                        Aucune table disponible.
                      </Text>
                    ) : (
                      availableTargets.map((entry) => (
                        <Pressable
                          key={entry.table.id}
                          onPress={() => setSelectedTableId(entry.table.id)}
                          style={{
                            padding: 10,
                            borderWidth: 1,
                            borderRadius: 10,
                            opacity:
                              selectedTableId === entry.table.id ? 1 : 0.7,
                          }}
                        >
                          <Text
                            style={{
                              fontWeight:
                                selectedTableId === entry.table.id ? "700" : "400",
                            }}
                          >
                            {entry.table.name}
                          </Text>
                          <Text style={{ marginTop: 2, opacity: 0.7, fontSize: 12 }}>
                            {entry.profiles.length} profil
                            {entry.profiles.length > 1 ? "s" : ""}
                          </Text>
                        </Pressable>
                      ))
                    )}
                  </View>
                </ScrollView>
              </View>

              <View>
                <Text style={{ marginBottom: 6, fontWeight: "700" }}>
                  Nom du nouveau profil
                </Text>
                <TextInput
                  value={profileName}
                  onChangeText={setProfileName}
                  placeholder="Nom du profil"
                  style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                />
              </View>
            </View>
          ) : null}

          {mode === "existing_table_existing_profile" ? (
            <View style={{ gap: 10 }}>
              <View>
                <Text style={{ marginBottom: 6, fontWeight: "700" }}>
                  Table existante
                </Text>

                <ScrollView style={{ maxHeight: 150 }}>
                  <View style={{ gap: 8 }}>
                    {loadingTargets ? (
                      <Text style={{ opacity: 0.72 }}>Chargement…</Text>
                    ) : availableTargets.length === 0 ? (
                      <Text style={{ opacity: 0.72 }}>
                        Aucune table disponible.
                      </Text>
                    ) : (
                      availableTargets.map((entry) => (
                        <Pressable
                          key={entry.table.id}
                          onPress={() => setSelectedTableId(entry.table.id)}
                          style={{
                            padding: 10,
                            borderWidth: 1,
                            borderRadius: 10,
                            opacity:
                              selectedTableId === entry.table.id ? 1 : 0.7,
                          }}
                        >
                          <Text
                            style={{
                              fontWeight:
                                selectedTableId === entry.table.id ? "700" : "400",
                            }}
                          >
                            {entry.table.name}
                          </Text>
                        </Pressable>
                      ))
                    )}
                  </View>
                </ScrollView>
              </View>

              <View>
                <Text style={{ marginBottom: 6, fontWeight: "700" }}>
                  Profil existant
                </Text>

                <ScrollView style={{ maxHeight: 150 }}>
                  <View style={{ gap: 8 }}>
                    {!selectedTable ? (
                      <Text style={{ opacity: 0.72 }}>
                        Sélectionne d’abord une table.
                      </Text>
                    ) : selectedTable.profiles.length === 0 ? (
                      <Text style={{ opacity: 0.72 }}>
                        Cette table ne contient aucun profil.
                      </Text>
                    ) : (
                      selectedTable.profiles.map((profile) => (
                        <Pressable
                          key={profile.id}
                          onPress={() => setSelectedProfileId(profile.id)}
                          style={{
                            padding: 10,
                            borderWidth: 1,
                            borderRadius: 10,
                            opacity:
                              selectedProfileId === profile.id ? 1 : 0.7,
                          }}
                        >
                          <Text
                            style={{
                              fontWeight:
                                selectedProfileId === profile.id ? "700" : "400",
                            }}
                          >
                            {profile.name}
                          </Text>
                        </Pressable>
                      ))
                    )}
                  </View>
                </ScrollView>
              </View>
            </View>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 4,
            }}
          >
            <Pressable
              onPress={onCancel}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 10,
              }}
            >
              <Text>Annuler</Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontWeight: "700" }}>Valider</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}