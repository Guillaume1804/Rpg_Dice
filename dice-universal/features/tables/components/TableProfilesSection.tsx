import { View, Text, Pressable } from "react-native";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type {
  GroupRow,
  GroupDieRow,
} from "../../../data/repositories/groupsRepo";

type ProfileWithGroups = {
  profile: ProfileRow;
  groups: {
    group: GroupRow;
    dice: GroupDieRow[];
  }[];
};

type Props = {
  profiles: ProfileWithGroups[];
  isSystem: boolean;
  getRuleName: (ruleId: string | null) => string;

  onRenameProfile: (profile: ProfileRow) => void;
  onCreateGroup: (profile: ProfileRow) => void;
  onDeleteProfile: (profile: ProfileRow) => Promise<void>;

  onRenameGroup: (group: GroupRow) => void;
  onEditGroupRule: (group: GroupRow) => void;
  onCreateDie: (group: GroupRow) => void;
  onDeleteGroup: (group: GroupRow) => Promise<void>;

  onEditDie: (die: GroupDieRow) => void;
  onDeleteDie: (die: GroupDieRow) => Promise<void>;
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
  if (profiles.length === 0) {
    return (
      <View
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
        }}
      >
        <Text style={{ opacity: 0.7 }}>
          Aucun profil dans cette table pour le moment.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {profiles.map(({ profile, groups }) => (
        <View
          key={profile.id}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            gap: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "700" }}>
                {profile.name}
              </Text>
              <Text style={{ opacity: 0.7 }}>
                {groups.length} action{groups.length > 1 ? "s" : ""}
              </Text>
            </View>

            {!isSystem ? (
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <Pressable
                  onPress={() => onCreateGroup(profile)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
                >
                  <Text>+ Action</Text>
                </Pressable>

                <Pressable
                  onPress={() => onRenameProfile(profile)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
                >
                  <Text>Renommer</Text>
                </Pressable>

                <Pressable
                  onPress={() => onDeleteProfile(profile)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
                >
                  <Text>Supprimer</Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          {groups.length === 0 ? (
            <Text style={{ opacity: 0.7 }}>Aucune action pour ce profil.</Text>
          ) : (
            <View style={{ gap: 10 }}>
              {groups.map(({ group, dice }) => (
                <View
                  key={group.id}
                  style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 10,
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "700", fontSize: 16 }}>
                        {group.name}
                      </Text>
                      <Text style={{ opacity: 0.7 }}>
                        Règle de groupe : {getRuleName(group.rule_id ?? null)}
                      </Text>
                    </View>

                    {!isSystem ? (
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <Pressable
                          onPress={() => onRenameGroup(group)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderWidth: 1,
                            borderRadius: 10,
                          }}
                        >
                          <Text>Renommer</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => onEditGroupRule(group)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderWidth: 1,
                            borderRadius: 10,
                          }}
                        >
                          <Text>Règle</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => onCreateDie(group)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderWidth: 1,
                            borderRadius: 10,
                          }}
                        >
                          <Text>+ Dé</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => onDeleteGroup(group)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderWidth: 1,
                            borderRadius: 10,
                          }}
                        >
                          <Text>Supprimer</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>

                  {dice.length === 0 ? (
                    <Text style={{ opacity: 0.7 }}>
                      Aucun dé dans cette action.
                    </Text>
                  ) : (
                    <View style={{ gap: 8 }}>
                      {dice.map((die) => (
                        <View
                          key={die.id}
                          style={{
                            borderWidth: 1,
                            borderRadius: 10,
                            padding: 10,
                            gap: 6,
                          }}
                        >
                          <Text style={{ fontWeight: "700" }}>
                            {die.qty}d{die.sides}
                            {die.modifier !== 0
                              ? ` ${die.modifier > 0 ? "+" : ""}${die.modifier}`
                              : ""}
                            {die.sign === -1 ? " (−)" : ""}
                          </Text>

                          <Text style={{ opacity: 0.7 }}>
                            Règle : {getRuleName(die.rule_id ?? null)}
                          </Text>

                          {!isSystem ? (
                            <View
                              style={{
                                flexDirection: "row",
                                gap: 8,
                                flexWrap: "wrap",
                              }}
                            >
                              <Pressable
                                onPress={() => onEditDie(die)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderWidth: 1,
                                  borderRadius: 10,
                                }}
                              >
                                <Text>Modifier</Text>
                              </Pressable>

                              <Pressable
                                onPress={() => onDeleteDie(die)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderWidth: 1,
                                  borderRadius: 10,
                                }}
                              >
                                <Text>Supprimer</Text>
                              </Pressable>
                            </View>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
