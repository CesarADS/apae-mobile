import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isAuthenticated, isInitializing } = useAuth();

  // Mostrar loading enquanto verifica sessão salva
  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  // Redirecionar baseado no estado de autenticação
  if (isAuthenticated) {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/login" />;
}
