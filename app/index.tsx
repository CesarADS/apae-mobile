import { Redirect } from "expo-router";

export default function Index() {
  // Use <Redirect /> para evitar navegação antes do Root Layout montar
  return <Redirect href="/login" />;
}
