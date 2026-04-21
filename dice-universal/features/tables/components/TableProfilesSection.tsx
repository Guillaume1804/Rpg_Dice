import type { ReactNode } from "react";
import { View, Text, Pressable } from "react-native";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type {
  GroupRow,
  GroupDieRow,
} from "../../../data/repositories/groupsRepo";

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
  activeFreeRollProfileId: string | null;
  onToggleProfileFreeRoll: (profile: ProfileRow) => void;
  renderProfileFreeRoll: (profile: ProfileRow) => ReactNode;
};

function formatDieLine(die: GroupDieRow) {
  const signPrefix = die.sign === -1 ? "-" : "";
  const modifier =
    die.modifier && die.modifier !== 0
      ? ` ${die.modifier > 0 ? "+" : ""}${die.modifier}`
      : "";

  return `${signPrefix}${die.qty}d${die.sides}${modifier}`;
}

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
  activeFreeRollProfileId,
  onToggleProfileFreeRoll,
  renderProfileFreeRoll,
}: Props) {
  return (
    <View
      style={{
        padding: 14,
        borderWidth: 1,
        borderRadius: 14,
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "800" }}>Profils</Text>

      {profiles.length === 0 ? (
        <Text style={{ marginTop: 8, opacity: 0.7 }}>Aucun profil.</Text>
      ) : (
        profiles.map(({ profile, groups }) => (
          <View
            key={profile.id}
            style={{
              padding: 14,
              borderWidth: 1,
              borderRadius: 14,
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "800" }}>
              {profile.name}
            </Text>

            <Text style={{ opacity: 0.72 }}>
              {groups.length} action{groups.length > 1 ? "s" : ""}
            </Text>

            {!isSystem ? (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <Pressable
                    onPress={() => onRenameProfile(profile)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderRadius: 8,
                    }}
                  >
                    <Text>Renommer le profil</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => onCreateGroup(profile)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderRadius: 8,
                    }}
                  >
                    <Text>Créer une action</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => onToggleProfileFreeRoll(profile)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderRadius: 8,
                    }}
                  >
                    <Text>
                      {activeFreeRollProfileId === profile.id
                        ? "Fermer le jet libre"
                        : "Jet libre"}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => onDeleteProfile(profile)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderRadius: 8,
                    }}
                  >
                    <Text>Supprimer le profil</Text>
                  </Pressable>
                </View>

                {activeFreeRollProfileId === profile.id
                  ? renderProfileFreeRoll(profile)
                  : null}
              </>
            ) : null}

            {groups.length === 0 ? (
              <Text style={{ marginTop: 8, opacity: 0.7 }}>Aucune action.</Text>
            ) : (
              groups.map(({ group, dice }) => (
                <View
                  key={group.id}
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderRadius: 12,
                    gap: 8,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "700" }}>
                    {group.name}
                  </Text>

                  <Text style={{ opacity: 0.72 }}>
                    Règle de l’action : {getRuleName(group.rule_id)}
                  </Text>

                  {!isSystem ? (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <Pressable
                        onPress={() => onRenameGroup(group)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderWidth: 1,
                          borderRadius: 8,
                        }}
                      >
                        <Text>Renommer l’action</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => onEditGroupRule(group)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderWidth: 1,
                          borderRadius: 8,
                        }}
                      >
                        <Text>Règle de l’action</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => onCreateDie(group)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderWidth: 1,
                          borderRadius: 8,
                        }}
                      >
                        <Text>Ajouter une entrée</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => onDeleteGroup(group)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderWidth: 1,
                          borderRadius: 8,
                        }}
                      >
                        <Text>Supprimer l’action</Text>
                      </Pressable>
                    </View>
                  ) : null}

                  {dice.length === 0 ? (
                    <Text style={{ marginTop: 8, opacity: 0.7 }}>
                      Aucune entrée.
                    </Text>
                  ) : (
                    dice.map((d) => (
                      <View
                        key={d.id}
                        style={{
                          marginTop: 10,
                          padding: 10,
                          borderWidth: 1,
                          borderRadius: 10,
                        }}
                      >
                        <Text style={{ fontWeight: "700" }}>
                          {formatDieLine(d)}
                        </Text>

                        <Text style={{ opacity: 0.72 }}>
                          Règle d’entrée : {getRuleName(d.rule_id)}
                        </Text>

                        {!isSystem ? (
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            <Pressable
                              onPress={() => onEditDie(d)}
                              style={{
                                paddingVertical: 8,
                                paddingHorizontal: 10,
                                borderWidth: 1,
                                borderRadius: 8,
                              }}
                            >
                              <Text>Éditer l’entrée</Text>
                            </Pressable>

                            <Pressable
                              onPress={() => onDeleteDie(d)}
                              style={{
                                paddingVertical: 8,
                                paddingHorizontal: 10,
                                borderWidth: 1,
                                borderRadius: 8,
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
