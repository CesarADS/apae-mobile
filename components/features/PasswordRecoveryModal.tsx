import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Input, Typography } from '../ui';
import { BaseModal } from './BaseModal';

interface PasswordRecoveryModalProps {
  visible: boolean;
  step: 'idle' | 'email' | 'reset';
  email: string;
  code: string;
  newPassword: string;
  loading: boolean;
  onChangeEmail: (v: string) => void;
  onChangeCode: (v: string) => void;
  onChangeNewPassword: (v: string) => void;
  onSendEmail: () => void;
  onResetPassword: () => void;
  onClose: () => void;
}

export const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({
  visible,
  step,
  email,
  code,
  newPassword,
  loading,
  onChangeEmail,
  onChangeCode,
  onChangeNewPassword,
  onSendEmail,
  onResetPassword,
  onClose,
}) => {
  if (step === 'idle') return null;

  const isEmailStep = step === 'email';
  const title = isEmailStep ? 'Recuperação de senha' : 'Redefinir senha';

  return (
    <BaseModal visible={visible} onClose={onClose} title={title}>
      <View style={styles.section}>
        {isEmailStep ? (
          <>
            <Input
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={onChangeEmail}
              style={styles.input}
            />
          </>
        ) : (
          <>
            <Typography style={styles.description}>
              Informe o código recebido e sua nova senha.
            </Typography>
            <Input
              placeholder="Código"
              keyboardType="number-pad"
              autoCapitalize="none"
              value={code}
              onChangeText={onChangeCode}
              style={styles.input}
            />
            <Input
              placeholder="Nova senha"
              secureTextEntry
              value={newPassword}
              onChangeText={onChangeNewPassword}
              style={styles.input}
            />
          </>
        )}
      </View>
      <View style={styles.actions}>
        {isEmailStep ? (
          <>
            <Button
              title="Enviar"
              size="small"
              onPress={onSendEmail}
              loading={loading}
              disabled={loading || !email}
              style={styles.actionBtn}
            />
            <Button
              title="Cancelar"
              variant="outline"
              size="small"
              onPress={onClose}
              style={styles.actionBtn}
            />
          </>
        ) : (
          <>
            <Button
              title="Redefinir"
              size="small"
              onPress={onResetPassword}
              loading={loading}
              disabled={loading || !code || !newPassword}
              style={styles.actionBtn}
            />
            <Button
              title="Cancelar"
              variant="outline"
              size="small"
              onPress={onClose}
              style={styles.actionBtn}
            />
          </>
        )}
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
    color: '#555',
  },
  actions: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 12,
    gap: 10,
  },
  actionBtn: {
    width: '100%',
  }
});
