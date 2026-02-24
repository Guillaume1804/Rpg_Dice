import { View, Text} from "react-native";

export default function RollScreen() {
    return (
        <View style={{flex: 1, padding: 16}}>
            <Text style={{fontSize: 18, fontWeight: "600" }}>Jet (à construire)</Text>
            <Text style={{ marginTop: 8 }}>Ici table de dés par défaut + groupes + résultat brut + résultat avec règles + statut (réussites/échec/critiques).</Text>
        </View>
    );
}