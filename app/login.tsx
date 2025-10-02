import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import {
  Button,
  Container,
  IconButton,
  Input,
  Modal,
  QRCodeScanner,
  Typography
} from '../components';
import { useAuth, usePasswordRecovery, useQRCode } from '../hooks';

export default function LoginScreen() {
  const [autoLoginTriggered, setAutoLoginTriggered] = React.useState(false);
  
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
      router.replace('/');
    }
    // O erro já está sendo tratado no useAuth hook
    // e será mostrado no useEffect abaixo
  };

  // Limpar flag de auto-login quando usuário digita manualmente
  useEffect(() => {
    // Este useEffect serve apenas para debugging
    if (__DEV__ && email && password) {
      console.log('Login state:', { email, password: password ? '***' : '', autoLoginTriggered, loading });
    }
  }, [email, password, autoLoginTriggered, loading]);

  const handleQRCodeScan = (data: string) => {
    const qrData = handleScan(data);
    if (qrData) {
      if (__DEV__) {
        console.log('QR Code scanned successfully:', { email: qrData.email, password: '***' });
      }
      
      // Limpar erro se houver
      if (error) clearError();
      
      // Reset flag antes de definir novos valores
      setAutoLoginTriggered(false);
      
      // Definir os valores
      setEmail(qrData.email);
      setPassword(qrData.password);
      
      // Fazer login direto após um pequeno delay
      setTimeout(async () => {
        if (__DEV__) {
          console.log('Starting QR auto-login with credentials:', { email: qrData.email, password: '***' });
        }
        setAutoLoginTriggered(true);
        
        // Passar credenciais diretamente para evitar condição de corrida
        const success = await login({ email: qrData.email, password: qrData.password });
        if (success) {
          if (__DEV__) {
            console.log('QR auto-login successful, navigating...');
          }
          router.replace('/');
        } else {
          if (__DEV__) {
            console.log('QR auto-login failed');
          }
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
    >
      <Container style={styles.content}>
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

        {/* Botão de login */}
        <Button
          title="Entrar"
          onPress={handleLogin}
          disabled={loading}
          loading={loading}
          style={[styles.loginButton, { width: '100%' }]}
        />

        {/* QR Code Scanner */}
        <Container style={styles.qrButton}>
          <IconButton
            iconName="qr-code-scanner"
            size={48}
            color="#007BFF"
            onPress={openScanner}
          />
          <Typography color="primary" style={styles.qrText}>
            Login via QR Code
          </Typography>
        </Container>

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

      {/* QR Code Scanner Modal */}
      {qrVisible && (
        <QRCodeScanner
          visible={qrVisible}
          onClose={closeScanner}
          onScan={handleQRCodeScan}
        />
      )}

      {/* Password Recovery Modal */}
      <Modal
        visible={step !== 'idle'}
        onClose={handleCloseRecovery}
        title={step === 'email' ? 'Recuperação de senha' : 'Redefinir senha'}
        showCloseButton={false}
        width="90%"
      >
        {step === 'email' && (
          <View style={styles.modalContent}>
            <Input
              placeholder="Digite seu e-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={recoveryEmail}
              onChangeText={setRecoveryEmail}
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                variant="outline"
                size="small"
                onPress={handleCloseRecovery}
                style={styles.modalActionButton}
              />
              <Button
                title="Enviar"
                size="small"
                onPress={handleForgotPassword}
                disabled={recoveryLoading || !recoveryEmail}
                loading={recoveryLoading}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        )}

        {step === 'reset' && (
          <View style={styles.modalContent}>
            <Typography style={styles.modalDescription}>
              Informe o código recebido por e-mail e sua nova senha.
            </Typography>
            
            <Input
              placeholder="Código recebido"
              autoCapitalize="none"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              style={styles.modalInput}
            />
            
            <Input
              placeholder="Nova senha"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.modalInput}
            />
            
            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                variant="outline"
                size="small"
                onPress={handleCloseRecovery}
                style={styles.modalActionButton}
              />
              <Button
                title="Redefinir"
                size="small"
                onPress={handleResetPassword}
                disabled={recoveryLoading || !code || !newPassword}
                loading={recoveryLoading}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        )}
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  content: {
    flex: 1,
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
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  qrButton: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: {
    marginTop: 8,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: 32,
    padding: 8,
  },
  modalContent: {
    width: '100%',
  },
  modalInput: {
    marginBottom: 16,
    width: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 0,
  },
  modalActionButton: {
    flex: 1,
    height: 40,
    minWidth: 0,
    marginHorizontal: 6,
  },
  modalDescription: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  errorContainer: {
    width: '100%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});
