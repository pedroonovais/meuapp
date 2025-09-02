import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ListScreen from "./src/screens/ListScreen";
import DetailScreen from "./src/screens/DetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Lista"
                    component={ListScreen}
                    options={{ title: "Posts" }}
                />
                <Stack.Screen
                    name="Detalhe"
                    component={DetailScreen}
                    options={{ title: "Detalhe do Post" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
