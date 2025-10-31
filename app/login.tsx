import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Container,
  Input,
  PasswordRecoveryModal,
  Typography
} from '../components';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { usePasswordRecovery, useQRCode } from '../hooks';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [autoLoginTriggered, setAutoLoginTriggered] = React.useState(false);
  const [slowLogin, setSlowLogin] = React.useState(false);
  const slowLoginTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const {
    email,
    password,
    loading,
    error,
    setEmail,
    setPassword,
    login,
    clearError,
  } = useAuth();

  const {
    step,
    email: recoveryEmail,
    code,
    newPassword,
    loading: recoveryLoading,
    setEmail: setRecoveryEmail,
    setCode,
    setNewPassword,
    sendRecoveryEmail,
    resetPassword,
    resetFlow,
    startRecovery,
  } = usePasswordRecovery();

  const {
    visible: qrVisible,
    scanned,
    error: qrError,
    openScanner,
    closeScanner,
    handleScan,
  } = useQRCode();

  const handleLogin = async () => {
    const success = await login();
    if (success) {
      // Navegar para tela principal ou dashboard
      router.push('./dashboard');
    }
    // O erro já está sendo tratado no useAuth hook
    // e será mostrado no useEffect abaixo
  };

  // Timeout para login lento
  useEffect(() => {
    if (loading) {
      setSlowLogin(false);
      if (slowLoginTimerRef.current) clearTimeout(slowLoginTimerRef.current);
      slowLoginTimerRef.current = setTimeout(() => {
        setSlowLogin(true);
      }, 8000); // 8s para considerar "lento"
    } else {
      if (slowLoginTimerRef.current) {
        clearTimeout(slowLoginTimerRef.current);
        slowLoginTimerRef.current = null;
      }
      setSlowLogin(false);
    }
  }, [loading]);

  const handleQRCodeScan = (data: string) => {
    const qrData = handleScan(data);
    if (qrData) {
      // Limpar erro se houver
      if (error) clearError();
      
      // Reset flag antes de definir novos valores
      setAutoLoginTriggered(false);
      
      // Definir os valores
      setEmail(qrData.email);
      setPassword(qrData.password);
      
      // Fazer login direto após um pequeno delay
      setTimeout(async () => {
        setAutoLoginTriggered(true);
        
        // Passar credenciais diretamente para evitar condição de corrida
        const success = await login({ email: qrData.email, password: qrData.password });
        if (success) {
          router.push('./dashboard');
        }
      }, 500); // Reduzindo para 500ms já que passamos credenciais diretamente
    }
  };

  const handleForgotPassword = async () => {
    if (!recoveryEmail) {
      return;
    }
    
    const success = await sendRecoveryEmail();
    if (!success && step === 'email') {
      // Se falhou, pode tentar novamente
      return;
    }
  };

  const handleResetPassword = async () => {
    const success = await resetPassword();
    if (success) {
      // Reset foi bem-sucedido, voltar para login normal
      resetFlow();
    }
  };

  const handleCloseRecovery = () => {
    resetFlow();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 12 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent, 
            { 
              paddingTop: insets.top + 64, // Aumentado de 32 para 64 para melhor centralização sem QR Code
              paddingBottom: insets.bottom + 32 
            }
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
      <Container style={styles.inner}>
        {/* Logo */}
        <Image 
          source={require("../assets/images/logo.png")} 
          style={styles.logo} 
          resizeMode="contain" 
        />

        {/* Título */}
        <Typography variant="h2" color="primary" align="center" style={styles.title}>
          Bem-vindo ao GED APAE
        </Typography>

        {/* Campos de login */}
        <Input
          placeholder="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setAutoLoginTriggered(false); // Reset flag on manual input
            if (error) clearError(); // Limpar erro quando usuário digita
          }}
          style={styles.input}
        />

        <Input
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setAutoLoginTriggered(false); // Reset flag on manual input
            if (error) clearError(); // Limpar erro quando usuário digita
          }}
          style={styles.input}
        />

        {/* Mensagem de erro */}
        {error && (
          <View style={styles.errorContainer}>
            <Typography color="error" style={styles.errorText}>
              {error}
            </Typography>
          </View>
        )}

        {/* Mensagem de login lento */}
        {!error && slowLogin && (
          <View style={styles.slowContainer}>
            <Typography style={styles.slowText}>
              O login está demorando mais que o esperado. Verifique sua conexão ou tente novamente em instantes.
            </Typography>
          </View>
        )}

        {/* Botão de login */}
        <Button
          title="Entrar"
          onPress={handleLogin}
          disabled={loading}
          loading={loading}
          style={[styles.loginButton, { width: '100%' }]}
        />

        {/* QR Code Scanner - TEMPORARIAMENTE DESABILITADO */}
        {/* Funcionalidade será implementada posteriormente */}
        {/* <Container style={styles.qrButton}>
          <IconButton
            iconName="qr-code-scanner"
            size={48}
            color={Colors.primary}
            onPress={openScanner}
          />
          <Typography color="primary" style={styles.qrText}>
            Login via QR Code
          </Typography>
        </Container> */}

        {/* Esqueci minha senha */}
        <TouchableOpacity 
          style={styles.forgotButton} 
          onPress={() => startRecovery(email)}
        >
          <Typography variant="link" color="error">
            Esqueci minha senha
          </Typography>
        </TouchableOpacity>
      </Container>

      {/* QR Code Scanner Modal - TEMPORARIAMENTE DESABILITADO */}
      {/* {qrVisible && (
        <QRCodeScanner
          visible={qrVisible}
          onClose={closeScanner}
          onScan={handleQRCodeScan}
        />
      )} */}

      <PasswordRecoveryModal
        visible={step !== 'idle'}
        step={step}
        email={recoveryEmail}
        code={code}
        newPassword={newPassword}
        loading={recoveryLoading}
        onChangeEmail={setRecoveryEmail}
        onChangeCode={setCode}
        onChangeNewPassword={setNewPassword}
        onSendEmail={handleForgotPassword}
        onResetPassword={handleResetPassword}
        onClose={handleCloseRecovery}
      />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// NOTA: Estilos ajustados para centralização sem o QR Code
// Para reverter quando implementar QR Code:
// 1. No ScrollView: paddingTop de 64 volta para 32
// 2. No forgotButton: marginTop de 48 volta para 32
// 3. Descomentar qrButton e qrText
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  inner: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  title: {
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  // Estilos do QR Code - TEMPORARIAMENTE DESABILITADO
  // Quando reativar o QR Code, descomentar estas linhas:
  // qrButton: {
  //   marginTop: 24,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  // qrText: {
  //   marginTop: 8,
  // },
  forgotButton: {
    alignSelf: 'center',
    marginTop: 48, // Aumentado de 32 para 48 para centralizar melhor sem o QR Code
    padding: 8,
  },
  errorContainer: {
    width: '100%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.errorLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  slowContainer: {
    width: '100%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.warningLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  slowText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
});
