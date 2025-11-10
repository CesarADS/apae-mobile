import { ErrorBoundary } from "@/components";
import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="digitalization" options={{ headerShown: false }} />
          {/* Outras telas podem ser adicionadas aqui */}
        </Stack>
      </AuthProvider>
    </ErrorBoundary>
  );
}
