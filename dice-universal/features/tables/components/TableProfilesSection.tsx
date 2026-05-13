// dice-universal\features\tables\components\TableProfilesSection.tsx

import { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type {
  GroupRow,
  GroupDieRow,
} from "../../../data/repositories/groupsRepo";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

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
      style={({ pressed }) => ({
        paddingVertical: 8,
        paddingHorizontal: 11,
        borderWidth: 1,
        borderColor: arcane.colors.border,
        borderRadius: arcane.radius.pill,
        backgroundColor: pressed
          ? arcane.colors.surfaceSoft
          : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
      })}
    >
      <Text style={{ color: arcane.colors.text, fontWeight: "800" }}>
        {label}
      </Text>
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
      <View style={arcaneStyles.card}>
        <Text style={arcaneStyles.sectionTitle}>Aucun profil</Text>

        <Text style={[arcaneStyles.muted, { marginTop: arcane.spacing.xs }]}>
          Aucun profil dans cette table pour le moment.
        </Text>
      </View>
    );
  }

  if (!selectedProfileEntry) {
    return (
      <View style={{ gap: arcane.spacing.md }}>
        <Text style={arcaneStyles.sectionTitle}>Profils</Text>

        {profiles.map(({ profile, groups }) => (
          <Pressable
            key={profile.id}
            onPress={() => {
              setSelectedProfileId(profile.id);
              onProfileDetailViewChange?.(true);
            }}
            style={({ pressed }) => ({
              ...arcaneStyles.card,
              gap: arcane.spacing.sm,
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
          >
            <View>
              <Text
                style={{
                  color: arcane.colors.text,
                  fontSize: 20,
                  fontWeight: "900",
                }}
              >
                {profile.name}
              </Text>

              <Text style={arcaneStyles.muted}>
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
    <View style={{ gap: arcane.spacing.md }}>
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
            ...arcaneStyles.card,
            gap: arcane.spacing.sm,
          }}
        >
          <Text
            style={{
              color: arcane.colors.text,
              fontSize: 24,
              fontWeight: "900",
            }}
          >
            {profile.name}
          </Text>

          <Text style={arcaneStyles.muted}>
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
        <View style={arcaneStyles.cardSoft}>
          <Text style={{ color: arcane.colors.text, fontWeight: "800" }}>
            Aucune action
          </Text>

          <Text style={[arcaneStyles.muted, { marginTop: arcane.spacing.xs }]}>
            Ce profil ne contient pas encore d’action.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {groups.map(({ group, dice }) => (
            <View
              key={group.id}
              style={{
                ...arcaneStyles.card,
                gap: arcane.spacing.sm,
              }}
            >
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    color: arcane.colors.text,
                    fontWeight: "900",
                    fontSize: 18,
                  }}
                >
                  {group.name}
                </Text>

                <Text style={arcaneStyles.muted}>
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
                <View style={arcaneStyles.cardSoft}>
                  <Text
                    style={{
                      color: arcane.colors.text,
                      fontWeight: "800",
                    }}
                  >
                    Aucun dé
                  </Text>

                  <Text
                    style={[
                      arcaneStyles.muted,
                      { marginTop: arcane.spacing.xs },
                    ]}
                  >
                    Cette action ne contient pas encore d’entrée de dés.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  {dice.map((die) => (
                    <View
                      key={die.id}
                      style={{
                        ...arcaneStyles.cardSoft,
                        gap: arcane.spacing.xs,
                      }}
                    >
                      <Text
                        style={{
                          color: arcane.colors.text,
                          fontWeight: "900",
                          fontSize: 15,
                        }}
                      >
                        {formatDie(die)}
                      </Text>

                      <Text style={arcaneStyles.muted}>
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
