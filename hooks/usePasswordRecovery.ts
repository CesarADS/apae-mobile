import { useState } from 'react';
import { Alert } from 'react-native';
import { AuthService } from '../services/authService';

type PasswordRecoveryStep = 'idle' | 'email' | 'reset';

export const usePasswordRecovery = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<PasswordRecoveryStep>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRecoveryEmail = async (): Promise<boolean> => {
    if (!email) {
      Alert.alert('Erro', 'Informe o e-mail para recuperação.');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      await AuthService.forgotPassword({ email });
      
      setLoading(false);
      setStep('reset');
      
      Alert.alert(
        'E-mail enviado', 
        'Se o e-mail estiver cadastrado, você receberá um código para redefinir sua senha.'
      );
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setLoading(false);
      setError(message);
      
      Alert.alert('Erro', 'Não foi possível enviar o e-mail de recuperação.');
      return false;
    }
  };

  const resetPassword = async (): Promise<boolean> => {
    if (!email || !code || !newPassword) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      await AuthService.resetPassword({ 
        email, 
        recoveryCode: code, 
        newPassword 
      });
      
      setLoading(false);
      resetFlow();
      
      Alert.alert('Sucesso', 'Senha redefinida com sucesso!');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setLoading(false);
      setError(message);
      
      Alert.alert('Erro', 'Não foi possível redefinir a senha. Verifique o código informado.');
      return false;
    }
  };

  const resetFlow = () => {
    setStep('idle');
    setEmail('');
    setCode('');
    setNewPassword('');
    setLoading(false);
    setError(null);
  };

  // Iniciar o fluxo com o email fornecido
  const startRecovery = (emailAddress: string) => {
    setEmail(emailAddress);
    setStep('email');
  };

  return {
    step,
    email,
    code,
    newPassword,
    loading,
    error,
    setEmail,
    setCode,
    setNewPassword,
    sendRecoveryEmail,
    resetPassword,
    resetFlow,
    startRecovery,
  };
};