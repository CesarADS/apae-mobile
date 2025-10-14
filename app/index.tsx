import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { Typography } from "../components";

export default function Index() {
  useEffect(() => {
    // Redirecionar para login automaticamente
    router.replace('./login');
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#FFF'
      }}
    >
      <Typography variant="body" color="secondary">
        Carregando...
      </Typography>
    </View>
  );
}
