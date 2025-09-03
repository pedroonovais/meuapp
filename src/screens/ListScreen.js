import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Pressable,
    StyleSheet,
    RefreshControl,
    Image,
} from "react-native";

const API = "https://www.demonslayer-api.com/api/v1/characters?limit=45";

export default function ListScreen({ navigation }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const normalize = (arr) =>
        arr.map((c, idx) => ({
            id: String(c.id ?? idx),
            name: c.name ?? "Sem nome",
            image:
                c.image ??
                c.img ??
                (Array.isArray(c.images)
                    ? c.images[0]?.url ?? c.images[0]
                    : null),
        }));

    const load = useCallback(async (signal) => {
        try {
            setError(null);
            const res = await fetch(API, { signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            const raw = Array.isArray(json) ? json : json.content ?? [];
            setData(normalize(raw));
        } catch (e) {
            if (e.name !== "AbortError")
                setError(e.message ?? "Erro inesperado");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    const onRefresh = () => {
        setRefreshing(true);
        const controller = new AbortController();
        load(controller.signal);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.helper}>Escolha seu personagem abaixo</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("Detalhe", { id: item.id })}>
            {item.image ? (
                <Image
                    source={{ uri: item.image }}
                    style={styles.avatar}
                    resizeMode="contain"
                />
            ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarFallbackText}>
                        {item.name?.[0]?.toUpperCase() ?? "?"}
                    </Text>
                </View>
            )}
            <Text style={styles.name} numberOfLines={1}>
                {item.name}
            </Text>
        </Pressable>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 8 }}>Carregando…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={{ marginBottom: 12 }}>Erro: {error}</Text>
                <Pressable
                    onPress={() => {
                        setLoading(true);
                        const c = new AbortController();
                        load(c.signal);
                    }}
                    style={styles.button}>
                    <Text style={styles.buttonText}>Tentar novamente</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListHeaderComponent={renderHeader}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={
                <Text style={{ textAlign: "center" }}>Nenhum personagem.</Text>
            }
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        />
    );
}

const styles = StyleSheet.create({
    list: { padding: 16, paddingBottom: 24 },
    header: { alignItems: "center", marginBottom: 16 },
    logo: { width: 220, height: 170, marginBottom: 6 },
    helper: { fontSize: 14, color: "#666" },

    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E9E9E9",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        border: "1px solid #000000",
    },
    avatar: {
        width: 64,
        height: 64,
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: "#E9E9E9",
    },
    avatarFallback: { justifyContent: "center", alignItems: "center" },
    avatarFallbackText: { fontSize: 22, fontWeight: "700", color: "#666", textAlign: "center" },
    name: { fontSize: 16, fontWeight: "700", flexShrink: 1 },

    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    button: {
        backgroundColor: "#111",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonText: { color: "#fff", fontWeight: "600" },
});
