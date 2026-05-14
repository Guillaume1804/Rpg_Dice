// dice-universal\features\tables\components\TableProfilesSection.tsx

import { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type {
  GroupRow,
  GroupDieRow,
} from "../../../data/repositories/groupsRepo";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

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
  const { theme } = useArcaneTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 8,
        paddingHorizontal: 11,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.pill,
        backgroundColor: pressed
          ? theme.colors.surfaceSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
      })}
    >
      <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
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
  const { theme, styles } = useArcaneTheme();
  
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
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Aucun profil</Text>

        <Text style={[styles.muted, { marginTop: theme.spacing.xs }]}>
          Aucun profil dans cette table pour le moment.
        </Text>
      </View>
    );
  }

  if (!selectedProfileEntry) {
    return (
      <View style={{ gap: theme.spacing.md }}>
        <Text style={styles.sectionTitle}>Profils</Text>

        {profiles.map(({ profile, groups }) => (
          <Pressable
            key={profile.id}
            onPress={() => {
              setSelectedProfileId(profile.id);
              onProfileDetailViewChange?.(true);
            }}
            style={({ pressed }) => ({
              ...styles.card,
              gap: theme.spacing.sm,
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
          >
            <View>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 20,
                  fontWeight: "900",
                }}
              >
                {profile.name}
              </Text>

              <Text style={styles.muted}>
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
    <View style={{ gap: theme.spacing.md }}>
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
            ...styles.card,
            gap: theme.spacing.sm,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 24,
              fontWeight: "900",
            }}
          >
            {profile.name}
          </Text>

          <Text style={styles.muted}>
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
        <View style={styles.cardSoft}>
          <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
            Aucune action
          </Text>

          <Text style={[styles.muted, { marginTop: theme.spacing.xs }]}>
            Ce profil ne contient pas encore d’action.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {groups.map(({ group, dice }) => (
            <View
              key={group.id}
              style={{
                ...styles.card,
                gap: theme.spacing.sm,
              }}
            >
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    fontSize: 18,
                  }}
                >
                  {group.name}
                </Text>

                <Text style={styles.muted}>
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
                <View style={styles.cardSoft}>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "800",
                    }}
                  >
                    Aucun dé
                  </Text>

                  <Text
                    style={[
                      styles.muted,
                      { marginTop: theme.spacing.xs },
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
                        ...styles.cardSoft,
                        gap: theme.spacing.xs,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.text,
                          fontWeight: "900",
                          fontSize: 15,
                        }}
                      >
                        {formatDie(die)}
                      </Text>

                      <Text style={styles.muted}>
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
