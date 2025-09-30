import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const API_URL = "https://gedapae.com.br/api/user/login"; // Tratar como tratar com variável de ambiente em um local só

export default function LoginScreen() {
  // Hooks para redefinição de senha
  const [resetVisible, setResetVisible] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Função para enviar redefinição de senha
  const handleResetPassword = async () => {
    if (!forgotEmail || !resetCode || !resetPassword) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    setResetLoading(true);
    try {
      const response = await fetch("https://gedapae.com.br/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, recoveryCode: resetCode, newPassword: resetPassword })
      });
      if (response.ok) {
        Alert.alert("Sucesso", "Senha redefinida com sucesso!");
        setResetVisible(false);
        setForgotEmail("");
        setResetCode("");
        setResetPassword("");
      } else {
        let errorMsg = `Não foi possível redefinir a senha. Verifique o código informado.\n(Status: ${response.status})`;
        try {
          const text = await response.text();
          if (text) {
            errorMsg += `\nResposta do servidor: ${text}`;
          }
        } catch {}
        Alert.alert("Erro", errorMsg);
      }
    } catch {
      Alert.alert("Erro", "Falha ao conectar ao servidor.");
    } finally {
      setResetLoading(false);
    }
  };
  // Hooks para recuperação de senha
  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Função para enviar recuperação de senha
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      Alert.alert("Erro", "Informe o e-mail para recuperação.");
      return;
    }
    setForgotLoading(true);
    try {
      const response = await fetch("https://gedapae.com.br/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      if (response.ok) {
        Alert.alert("Sucesso", "Se o e-mail estiver cadastrado, você receberá um código para redefinir sua senha.");
        setForgotVisible(false);
        setResetVisible(true);
      } else {
        Alert.alert("Erro", "Não foi possível enviar o e-mail de recuperação.");
      }
    } catch {
      Alert.alert("Erro", "Falha ao conectar ao servidor.");
    } finally {
      setForgotLoading(false);
    }
  };
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
      {/* Modal de recuperação de senha */}
      {forgotVisible && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {forgotLoading && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255,255,255,0.7)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 99,
              }}>
                <ActivityIndicator size="large" color="#007BFF" />
              </View>
            )}
            <Text style={styles.modalTitle}>Recuperação de senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={forgotEmail}
              onChangeText={setForgotEmail}
              editable={!forgotLoading}
            />
            <TouchableOpacity style={styles.button} onPress={handleForgotPassword} disabled={forgotLoading}>
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeModal} onPress={() => setForgotVisible(false)} disabled={forgotLoading}>
              <Text style={{ color: '#007BFF', fontWeight: 'bold' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
        if (!data.permissions || !data.permissions.includes("DOCUMENTOS")) {
          Alert.alert("Permissão insuficiente", "Você não tem permissão para digitalizar documentos");
          return;
        }
        // Aqui você pode salvar o token e navegar para a tela principal
    } catch (err) {
  const msg = err instanceof Error ? err.message : "Erro desconhecido";
  Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
        <TouchableOpacity style={styles.forgotButton} onPress={() => setForgotVisible(true)}>
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>
        {scannerVisible && (
          <View style={styles.scannerContainer}>
            {!permission ? (
              <Text>Solicitando permissão para acessar a câmera...</Text>
            ) : !(permission?.granted) ? (
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
        {/* Modal de recuperação de senha */}
        {forgotVisible && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Recuperação de senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                autoCapitalize="none"
                keyboardType="email-address"
                value={forgotEmail}
                onChangeText={setForgotEmail}
                editable={!forgotLoading}
              />
              <TouchableOpacity style={styles.button} onPress={handleForgotPassword} disabled={forgotLoading}>
                {forgotLoading ? <ActivityIndicator color="#007BFF" /> : <Text style={styles.buttonText}>Enviar</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeModal} onPress={() => setForgotVisible(false)} disabled={forgotLoading}>
                <Text style={{ color: '#007BFF', fontWeight: 'bold' }}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {/* Modal de redefinição de senha */}
        {resetVisible && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Redefinir senha</Text>
              <Text style={{ marginBottom: 8, color: '#222', textAlign: 'center' }}>
                Informe o código recebido por e-mail e sua nova senha.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Código recebido"
                autoCapitalize="none"
                keyboardType="number-pad"
                value={resetCode}
                onChangeText={setResetCode}
              />
              <TextInput
                style={styles.input}
                placeholder="Nova senha"
                secureTextEntry
                value={resetPassword}
                onChangeText={setResetPassword}
              />
              <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={resetLoading}>
                {resetLoading ? <ActivityIndicator color="#007BFF" /> : <Text style={styles.buttonText}>Redefinir</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeModal} onPress={() => setResetVisible(false)}>
                <Text style={{ color: '#007BFF', fontWeight: 'bold' }}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  forgotButton: {
    alignSelf: 'center',
    marginTop: 64,
    marginBottom: 8,
  },
  forgotText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    color: '#007BFF',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  closeModal: {
    marginTop: 16,
    padding: 8,
  },
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
    minHeight: '100%',
    display: 'flex',
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
