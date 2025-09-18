import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const API_URL = "https://gedapae.com.br/api/user/login"; // Tratar como tratar com variável de ambiente em um local só

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);

  React.useEffect(() => {
    if (scannerVisible && !permission?.granted) {
      requestPermission();
    }
  }, [scannerVisible, permission]);

  React.useEffect(() => {
    if (autoLogin && email && password) {
      handleLogin();
      setAutoLogin(false);
    }
  }, [autoLogin, email, password]);

  const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
    if (scanned) return;
    setScanned(true);
    try {
      const payload = JSON.parse(data);
      if (payload.email && payload.password) {
        setEmail(payload.email);
        setPassword(payload.password);
        setScannerVisible(false);
        setAutoLogin(true);
        setTimeout(() => setScanned(false), 1000);
      } else {
        Alert.alert('QR Code inválido', 'O QR Code não contém email e senha.');
        setTimeout(() => setScanned(false), 1000);
      }
    } catch {
      Alert.alert('QR Code inválido', 'Não foi possível ler os dados do QR Code.');
      setTimeout(() => setScanned(false), 1000);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error("Usuário ou senha inválidos");
      const data = await response.json();
      // Aqui você pode salvar o token e navegar para a tela principal
      Alert.alert("Login realizado com sucesso!");
    } catch (err) {
  const msg = err instanceof Error ? err.message : "Erro desconhecido";
  Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Bem-vindo ao GED APAE</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#007BFF" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.qrButton} onPress={() => setScannerVisible(true)}>
        <MaterialIcons name="qr-code-scanner" size={48} color="#007BFF" />
        <Text style={{ color: '#007BFF', fontWeight: 'bold', marginTop: 8 }}>Login via QR Code</Text>
      </TouchableOpacity>
      {scannerVisible && (
        <View style={styles.scannerContainer}>
          {!permission ? (
            <Text>Solicitando permissão para acessar a câmera...</Text>
          ) : !permission.granted ? (
            <Text>Permissão para câmera negada.</Text>
          ) : (
            <CameraView
              style={{ flex: 1, width: '100%' }}
              onBarcodeScanned={handleBarCodeScanned}
              facing="back"
            />
          )}
          <TouchableOpacity style={styles.closeScanner} onPress={() => { setScannerVisible(false); setScanned(false); }}>
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  qrButton: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    color: "#007BFF",
    fontWeight: "bold",
    marginBottom: 32,
  },
  input: {
    width: "100%",
    height: 48,
    borderColor: "#007BFF",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFF",
    color: "#222",
  },
  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#FFF",
    borderColor: "#007BFF",
    borderWidth: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#007BFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  scannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 16,
  },
  closeScanner: {
    position: 'absolute',
    bottom: 32,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
});
