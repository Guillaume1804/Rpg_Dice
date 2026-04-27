import { useMemo, useState } from "react";
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

  onProfileDetailViewChange?: (isDetail: boolean) => void;

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

function SmallButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 10,
      }}
    >
      <Text style={{ fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

function formatDie(die: GroupDieRow) {
  return `${die.qty}d${die.sides}${
    die.modifier !== 0 ? ` ${die.modifier > 0 ? "+" : ""}${die.modifier}` : ""
  }${die.sign === -1 ? " (−)" : ""}`;
}

export function TableProfilesSection({
  profiles,
  isSystem,
  getRuleName,
  onProfileDetailViewChange,
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
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );

  const selectedProfileEntry = useMemo(() => {
    if (!selectedProfileId) return null;

    return (
      profiles.find((entry) => entry.profile.id === selectedProfileId) ?? null
    );
  }, [profiles, selectedProfileId]);

  if (profiles.length === 0) {
    return (
      <View style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}>
        <Text style={{ opacity: 0.7 }}>
          Aucun profil dans cette table pour le moment.
        </Text>
      </View>
    );
  }

  if (!selectedProfileEntry) {
    return (
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "800" }}>Profils</Text>

        {profiles.map(({ profile, groups }) => (
          <Pressable
            key={profile.id}
            onPress={() => {
              setSelectedProfileId(profile.id);
              onProfileDetailViewChange?.(true);
            }}
            style={{
              borderWidth: 1,
              borderRadius: 14,
              padding: 12,
              gap: 8,
            }}
          >
            <View>
              <Text style={{ fontSize: 20, fontWeight: "800" }}>
                {profile.name}
              </Text>

              <Text style={{ opacity: 0.7 }}>
                {groups.length} action{groups.length > 1 ? "s" : ""}
              </Text>
            </View>

            {!isSystem ? (
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <SmallButton
                  label="+ Action"
                  onPress={() => onCreateGroup(profile)}
                />
                <SmallButton
                  label="Renommer"
                  onPress={() => onRenameProfile(profile)}
                />
                <SmallButton
                  label="Supprimer"
                  onPress={() => onDeleteProfile(profile)}
                />
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>
    );
  }

  const { profile, groups } = selectedProfileEntry;

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 8 }}>
        <SmallButton
          label="← Profils"
          onPress={() => {
            setSelectedProfileId(null);
            onProfileDetailViewChange?.(false);
          }}
        />

        <View
          style={{
            borderWidth: 1,
            borderRadius: 14,
            padding: 12,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "900" }}>
            {profile.name}
          </Text>

          <Text style={{ opacity: 0.7 }}>
            {groups.length} action{groups.length > 1 ? "s" : ""}
          </Text>

          {!isSystem ? (
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <SmallButton
                label="+ Action"
                onPress={() => onCreateGroup(profile)}
              />
              <SmallButton
                label="Renommer"
                onPress={() => onRenameProfile(profile)}
              />
              <SmallButton
                label="Supprimer"
                onPress={() => onDeleteProfile(profile)}
              />
            </View>
          ) : null}
        </View>
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
                borderRadius: 12,
                padding: 12,
                gap: 10,
              }}
            >
              <View style={{ gap: 6 }}>
                <Text style={{ fontWeight: "800", fontSize: 17 }}>
                  {group.name}
                </Text>

                <Text style={{ opacity: 0.7 }}>
                  Règle de groupe : {getRuleName(group.rule_id ?? null)}
                </Text>
              </View>

              {!isSystem ? (
                <View
                  style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                >
                  <SmallButton
                    label="Renommer"
                    onPress={() => onRenameGroup(group)}
                  />
                  <SmallButton
                    label="Règle"
                    onPress={() => onEditGroupRule(group)}
                  />
                  <SmallButton
                    label="+ Dé"
                    onPress={() => onCreateDie(group)}
                  />
                  <SmallButton
                    label="Supprimer"
                    onPress={() => onDeleteGroup(group)}
                  />
                </View>
              ) : null}

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
                        borderRadius: 12,
                        padding: 10,
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontWeight: "800", fontSize: 15 }}>
                        {formatDie(die)}
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
                          <SmallButton
                            label="Modifier"
                            onPress={() => onEditDie(die)}
                          />
                          <SmallButton
                            label="Supprimer"
                            onPress={() => onDeleteDie(die)}
                          />
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
  );
}
