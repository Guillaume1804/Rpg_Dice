import { View, Text, Pressable } from "react-native";

type TableDetailHeaderProps = {
  tableName: string;
  isSystem: boolean;
  onRenameTable: () => void;
  onCreateProfile: () => void;
};

export function TableDetailHeader({
  tableName,
  isSystem,
  onRenameTable,
  onCreateProfile,
}: TableDetailHeaderProps) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{tableName}</Text>

      {isSystem ? (
        <Text style={{ opacity: 0.7 }}>
          Table système : modification interdite
        </Text>
      ) : (
        <View style={{ gap: 8 }}>
          <Pressable
            onPress={onRenameTable}
            style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
          >
            <Text>Renommer la table</Text>
          </Pressable>

          <Pressable
            onPress={onCreateProfile}
            style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
          >
            <Text>Créer un profil</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}