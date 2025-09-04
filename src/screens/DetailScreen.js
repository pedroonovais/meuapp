import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet as RNStyleSheet,
} from "react-native";

const API = "https://www.demonslayer-api.com/api/v1/characters";

export default function DetailScreen({ route }) {
    const { id } = route.params;
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const normalize = (c) => ({
        id: String(c.id),
        name: c.name ?? "Sem nome",
        age: c.age ?? "-",
        gender: c.gender ?? "-",
        race: c.race ?? "-",
        description: c.description ?? "",
        quote: c.quote ?? "",
        image:
            c.image ??
            c.img ??
            (Array.isArray(c.images) ? c.images[0]?.url ?? c.images[0] : null),
    });

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                setError(null);
                const res = await fetch(`${API}?id=${encodeURIComponent(id)}`, {
                    signal: controller.signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const raw = Array.isArray(json) ? json : json.content ?? [];
                const first = raw[0];
                setItem(first ? normalize(first) : null);
            } catch (e) {
                if (e.name !== "AbortError")
                    setError(e.message ?? "Erro inesperado");
            } finally {
                setLoading(false);
            }
        })();
        return () => controller.abort();
    }, [id]);

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
                <Text>Erro: {error}</Text>
            </View>
        );
    }
    if (!item) {
        return (
            <View style={styles.center}>
                <Text>Personagem não encontrado.</Text>
            </View>
        );
    }

    const isDemon =
        String(item.race || "").toLowerCase() === "demon" ||
        String(item.race || "").toLowerCase() === "demônio";
    const bg = isDemon
        ? require("../../assets/background-demon.png")
        : require("../../assets/background-human.png");

    return (
        <View style={styles.container}>
            <ImageBackground
                source={bg}
                style={styles.bg}
                imageStyle={styles.bgImg}
                resizeMode="cover"
            />

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.hero}>
                    {!!item.image && (
                        <Image
                            source={{ uri: item.image }}
                            style={styles.heroChar}
                            resizeMode="contain"
                        />
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.name}>{item.name}</Text>

                    <View style={styles.pillsRow}>
                        <View style={styles.pill}>
                            <Text style={styles.pillLabel}>Idade: </Text>
                            <Text style={styles.pillValue}>{item.age}</Text>
                        </View>
                        <View style={styles.pill}>
                            <Text style={styles.pillLabel}>Raça: </Text>
                            <Text style={styles.pillLink}>{item.race}</Text>
                        </View>
                        <View style={styles.pill}>
                            <Text style={styles.pillLabel}>Gênero: </Text>
                            <Text style={styles.pillLink}>{item.gender}</Text>
                        </View>
                    </View>

                    {!!item.description && (
                        <Text style={styles.description}>
                            {item.description}
                        </Text>
                    )}

                    {!!item.quote && (
                        <View style={styles.quoteBox}>
                            <Text style={styles.quoteText}>{item.quote}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bg: { ...RNStyleSheet.absoluteFillObject },
    bgImg: { width: "100%", height: "100%" },
    scroll: { paddingBottom: 32 },

    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },

    hero: {
        height: 280,
        position: "relative",
        justifyContent: "flex-end",
    },
    heroChar: {
        position: "absolute",
        bottom: -32,
        alignSelf: "center",
        width: 260,
        height: 260,
        zIndex: 2,
    },

    card: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 64,
        marginTop: -32,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10,
        elevation: 3,
        height: "100%",
    },
    name: {
        fontSize: 24,
        fontWeight: "800",
        textAlign: "center",
        marginTop: 8,
        marginBottom: 14,
    },

    pillsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "center",
        marginBottom: 12,
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F3F4",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    pillLabel: { color: "#666", fontWeight: "600" },
    pillValue: { color: "#d64b4b", fontWeight: "800" },
    pillLink: { color: "#5a56f0", fontWeight: "700" },

    description: {
        color: "#333",
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
        textAlign: "justify",
    },

    quoteBox: {
        backgroundColor: "#111",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignSelf: "flex-start",
    },
    quoteText: {
        color: "#fff",
        fontStyle: "italic",
        fontWeight: "600",
    },
});
