import { useMemo } from "react";
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

function getLatestResultForProfile(
  profile: ProfileWithGroups,
  results: GroupRollResult[]
) {
  const groupIds = new Set(profile.groups.map((entry) => entry.group.id));
  const matching = results.filter((result) => groupIds.has(result.groupId));
  if (matching.length === 0) return null;
  return matching[matching.length - 1];
}

export function TableActionSection({
  profiles,
  selectedProfileId,
  results,
  onSelectProfile,
  onRollProfile,
  onRollGroup,
  onRollAll,
}: Props) {
  const selectedProfile =
    profiles.find((p) => p.profile.id === selectedProfileId) ?? profiles[0] ?? null;

  const latestResult = useMemo(() => {
    if (!selectedProfile) return null;
    return getLatestResultForProfile(selectedProfile, results);
  }, [selectedProfile, results]);

  if (!selectedProfile) {
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
        <Text style={{ fontSize: 16, fontWeight: "800" }}>Mode Table</Text>
        <Text style={{ opacity: 0.72 }}>
          Cette table ne contient encore aucun profil.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 12, gap: 12 }}>
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
          {profiles.map((profileEntry) => {
            const isActive = profileEntry.profile.id === selectedProfile.profile.id;

            return (
              <Pressable
                key={profileEntry.profile.id}
                onPress={() => onSelectProfile(profileEntry.profile.id)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 999,
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: isActive ? "800" : "600" }}>
                  {profileEntry.profile.name}
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
          selectedProfile.groups.map(({ group, dice }) => (
            <View
              key={group.id}
              style={{
                padding: 12,
                borderWidth: 1,
                borderRadius: 12,
                gap: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "800" }}>
                    {group.name}
                  </Text>

                  <Text style={{ marginTop: 4, opacity: 0.72 }}>
                    {dice.length} entrée{dice.length > 1 ? "s" : ""}
                  </Text>
                </View>

                <Pressable
                  onPress={() => onRollGroup(selectedProfile.profile.id, group.id)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>Lancer</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      <View
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 14,
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "800" }}>Dernier résultat</Text>

        {!latestResult ? (
          <Text style={{ opacity: 0.72 }}>
            Lance une action du profil pour afficher son résultat ici.
          </Text>
        ) : (
          <>
            <Text style={{ opacity: 0.72 }}>{latestResult.label}</Text>

            <Text style={{ fontSize: 40, fontWeight: "900" }}>
              {latestResult.total}
            </Text>

            <Text style={{ opacity: 0.72 }}>
              Somme des entrées : {latestResult.entries_total}
            </Text>

            <Text style={{ opacity: 0.72 }}>
              Valeurs :{" "}
              {latestResult.entries
                .flatMap((entry) => entry.signed_values)
                .join(" + ")}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}