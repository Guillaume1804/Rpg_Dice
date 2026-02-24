import {Link} from "expo-router";
import { View, Text, Pressable} from "react-native";

function Btn({ href, label } : { href : any; label: string }) {
    return (
        <Link href={href} asChild>
            <Pressable style={{ padding: 14, borderWidth: 1, borderRadius: 12, marginTop: 12}}>
                <Text style={{fontSize: 16}}>{label}</Text>
            </Pressable>
        </Link>
    );
}

export default function Home() {
    return (
        <View style={{ flex:1, padding: 16, gap: 12}}>
            <Text style={{fontSize: 22, fontWeight: 600}}>Dice Universal (V1.0)</Text>
            <Text>Choisis une action :</Text>
            <Btn href="/roll" label="Jet instantané (table par défaut)"/>
            <Btn href="/tables" label="Ouvrir mes tables personnelles"/>
            <Btn href="/history" label="Consulter l'historique des jets"/>
        </View>
    );
}