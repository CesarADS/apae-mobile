import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: "Login" }} />
      {/* Outras telas podem ser adicionadas aqui */}
    </Stack>
  );
}
