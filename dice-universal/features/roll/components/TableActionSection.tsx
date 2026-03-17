import { ScrollView, View, Text, Pressable } from "react-native";
import type { GroupRollResult } from "../../../core/roll/roll";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type { GroupRow, GroupDieRow } from "../../../data/repositories/groupsRepo";

type ProfileWithGroups = {
  profile: ProfileRow;
  groups: {
    group: GroupRow;
    dice: GroupDieRow[];
  }[];
};

type Props = {
  profiles: ProfileWithGroups[];
  selectedProfileId: string | null;
  results: GroupRollResult[];
  onSelectProfile: (profileId: string) => void;
  onRollProfile: (profileId: string) => void;
  onRollGroup: (profileId: string, groupId: string) => void;
  onRollAll: () => void;
};

export function TableActionSection({
  profiles,
  selectedProfileId,
  results,
  onSelectProfile,
  onRollProfile,
  onRollGroup,
  onRollAll,
}: Props) {
  if (profiles.length === 0) {
    return (
      <View
        style={{
          marginTop: 12,
          padding: 14,
          borderWidth: 1,
          borderRadius: 14,
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "800" }}>Table active</Text>
        <Text style={{ opacity: 0.72 }}>
          Cette table ne contient encore aucun profil.
        </Text>
      </View>
    );
  }

  const selectedProfile =
    profiles.find((p) => p.profile.id === selectedProfileId) ?? profiles[0];

  return (
    <View
      style={{
        marginTop: 12,
        gap: 12,
      }}
    >
      <View
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 14,
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "800" }}>Profils</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {profiles.map((p) => {
            const isActive = p.profile.id === selectedProfile.profile.id;

            return (
              <Pressable
                key={p.profile.id}
                onPress={() => onSelectProfile(p.profile.id)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 999,
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: isActive ? "800" : "600" }}>
                  {p.profile.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <Pressable
            onPress={() => onRollProfile(selectedProfile.profile.id)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "700" }}>Lancer le profil</Text>
          </Pressable>

          <Pressable
            onPress={onRollAll}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "700" }}>Lancer la table</Text>
          </Pressable>
        </View>
      </View>

      <View
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 14,
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "800" }}>
          Actions — {selectedProfile.profile.name}
        </Text>

        {selectedProfile.groups.length === 0 ? (
          <Text style={{ opacity: 0.72 }}>
            Ce profil ne contient encore aucune action.
          </Text>
        ) : (
          selectedProfile.groups.map(({ group, dice }) => {
            const result = results.find((r) => r.groupId === group.id);

            return (
              <Pressable
                key={group.id}
                onPress={() =>
                  onRollGroup(selectedProfile.profile.id, group.id)
                }
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 12,
                  gap: 6,
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
                    <Text style={{ fontSize: 15, fontWeight: "800" }}>
                      {group.name}
                    </Text>

                    <Text style={{ marginTop: 4, opacity: 0.72 }}>
                      {dice.length} entrée{dice.length > 1 ? "s" : ""}
                    </Text>
                  </View>

                  <View
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>Lancer</Text>
                  </View>
                </View>

                {result ? (
                  <View
                    style={{
                      marginTop: 4,
                      paddingTop: 8,
                      borderTopWidth: 1,
                    }}
                  >
                    <Text style={{ opacity: 0.72 }}>Dernier résultat</Text>
                    <Text style={{ fontSize: 28, fontWeight: "900" }}>
                      {result.total}
                    </Text>
                    <Text style={{ opacity: 0.72 }}>
                      Somme des entrées : {result.entries_total}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}