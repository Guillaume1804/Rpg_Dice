import { View, Text, Pressable } from "react-native";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type { GroupRow, GroupDieRow } from "../../../data/repositories/groupsRepo";

type GroupWithDice = {
  group: GroupRow;
  dice: GroupDieRow[];
};

type ProfileWithGroups = {
  profile: ProfileRow;
  groups: GroupWithDice[];
};

type Props = {
  profiles: ProfileWithGroups[];
  isSystem: boolean;
  getRuleName: (ruleId: string | null) => string;
  onRenameProfile: (profile: ProfileRow) => void;
  onCreateGroup: (profile: ProfileRow) => void;
  onDeleteProfile: (profile: ProfileRow) => void;
  onRenameGroup: (group: GroupRow) => void;
  onEditGroupRule: (group: GroupRow) => void;
  onCreateDie: (group: GroupRow) => void;
  onDeleteGroup: (group: GroupRow) => void;
  onEditDie: (die: GroupDieRow) => void;
  onDeleteDie: (die: GroupDieRow) => void;
};

export function TableProfilesSection({
  profiles,
  isSystem,
  getRuleName,
  onRenameProfile,
  onCreateGroup,
  onDeleteProfile,
  onRenameGroup,
  onEditGroupRule,
  onCreateDie,
  onDeleteGroup,
  onEditDie,
  onDeleteDie,
}: Props) {
  return (
    <View style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
      <Text style={{ fontWeight: "700" }}>Profils</Text>

      {profiles.length === 0 ? (
        <Text style={{ marginTop: 8, opacity: 0.7 }}>Aucun profil.</Text>
      ) : (
        profiles.map(({ profile, groups }) => (
          <View key={profile.id} style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "800" }}>{profile.name}</Text>

            {!isSystem ? (
              <View style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}>
                <Pressable
                  onPress={() => onRenameProfile(profile)}
                  style={{
                    padding: 8,
                    borderWidth: 1,
                    borderRadius: 8,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text>Renommer le profil</Text>
                </Pressable>

                <Pressable
                  onPress={() => onCreateGroup(profile)}
                  style={{
                    padding: 8,
                    borderWidth: 1,
                    borderRadius: 8,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text>Créer une action</Text>
                </Pressable>

                <Pressable
                  onPress={() => onDeleteProfile(profile)}
                  style={{
                    padding: 8,
                    borderWidth: 1,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text>Supprimer le profil</Text>
                </Pressable>
              </View>
            ) : null}

            {groups.length === 0 ? (
              <Text style={{ marginTop: 8, opacity: 0.7 }}>Aucune action.</Text>
            ) : (
              groups.map(({ group, dice }) => (
                <View
                  key={group.id}
                  style={{ marginTop: 12, padding: 12, borderWidth: 1, borderRadius: 12 }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "700" }}>{group.name}</Text>

                  <Text style={{ marginTop: 4, opacity: 0.8 }}>
                    règle de groupe : {getRuleName(group.rule_id)}
                  </Text>

                  {!isSystem ? (
                    <View style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}>
                      <Pressable
                        onPress={() => onRenameGroup(group)}
                        style={{
                          padding: 8,
                          borderWidth: 1,
                          borderRadius: 8,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text>Renommer l’action</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => onEditGroupRule(group)}
                        style={{
                          padding: 8,
                          borderWidth: 1,
                          borderRadius: 8,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text>Règle de l’action</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => onCreateDie(group)}
                        style={{
                          padding: 8,
                          borderWidth: 1,
                          borderRadius: 8,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text>Ajouter une entrée</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => onDeleteGroup(group)}
                        style={{
                          padding: 8,
                          borderWidth: 1,
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text>Supprimer l’action</Text>
                      </Pressable>
                    </View>
                  ) : null}

                  {dice.length === 0 ? (
                    <Text style={{ marginTop: 8, opacity: 0.7 }}>Aucune entrée.</Text>
                  ) : (
                    dice.map((d) => (
                      <View
                        key={d.id}
                        style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}
                      >
                        <Text style={{ fontWeight: "700" }}>
                          {d.qty}d{d.sides}
                        </Text>

                        <Text style={{ marginTop: 4, opacity: 0.8 }}>
                          signe : {d.sign === -1 ? "-" : "+"} | mod : {d.modifier}
                        </Text>

                        <Text style={{ marginTop: 4, opacity: 0.8 }}>
                          règle d’entrée : {getRuleName(d.rule_id)}
                        </Text>

                        {!isSystem ? (
                          <View style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}>
                            <Pressable
                              onPress={() => onEditDie(d)}
                              style={{
                                padding: 8,
                                borderWidth: 1,
                                borderRadius: 8,
                                marginRight: 8,
                                marginBottom: 8,
                              }}
                            >
                              <Text>Éditer l’entrée</Text>
                            </Pressable>

                            <Pressable
                              onPress={() => onDeleteDie(d)}
                              style={{
                                padding: 8,
                                borderWidth: 1,
                                borderRadius: 8,
                                marginBottom: 8,
                              }}
                            >
                              <Text>Supprimer l’entrée</Text>
                            </Pressable>
                          </View>
                        ) : null}
                      </View>
                    ))
                  )}
                </View>
              ))
            )}
          </View>
        ))
      )}
    </View>
  );
}