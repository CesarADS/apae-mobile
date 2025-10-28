import { Button, Typography } from '@/components';
import { useDocumentUpload } from '@/hooks';
import { CapturedPage, EntityType } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UploadScreen() {
  const router = useRouter();
  const { entityType, formData: formDataParam, pages: pagesParam } = useLocalSearchParams<{
    entityType: EntityType;
    formData: string;
    pages: string;
  }>();

  const { uploadDocument, uploading, progress, progressMessage } = useDocumentUpload();
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Iniciar upload automaticamente ao montar
    handleUpload();
  }, []);

  const handleUpload = async () => {
    if (!formDataParam || !pagesParam) {
      Alert.alert('Erro', 'Dados incompletos');
      return;
    }

    try {
      const formData = JSON.parse(formDataParam);
      const pages: CapturedPage[] = JSON.parse(pagesParam);

      const result = await uploadDocument({
        entityType: entityType as EntityType,
        formData,
        pages,
      });

      setUploadComplete(true);
      setUploadSuccess(result.success);

      if (!result.success) {
        setErrorMessage(result.message || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setUploadComplete(true);
      setUploadSuccess(false);
      setErrorMessage(error.message || 'Erro ao processar dados');
    }
  };

  const handleFinish = () => {
    // Voltar para o dashboard
    router.replace('/dashboard' as any);
  };

  const handleGoToLogin = () => {
    // Redirecionar para tela de login
    router.replace('/login' as any);
  };

  const isSessionExpired = errorMessage.includes('sessão expirou') || errorMessage.includes('login novamente');

  const handleScanAnother = () => {
    // Navegar para o formulário mantendo os dados da entidade
    router.push({
      pathname: './form' as any,
      params: {
        entityType,
        prefillData: formDataParam, // Passa os dados anteriores para preencher o formulário
      },
    });
  };

  const getEntityLabel = () => {
    switch (entityType) {
      case 'aluno':
        return 'Aluno';
      case 'colaborador':
        return 'Colaborador';
      case 'instituicao':
        return 'Institucional';
      default:
        return 'Documento';
    }
  };

  // Estado de upload em andamento
  if (!uploadComplete) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.uploadingContainer}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="cloud-upload" size={64} color="#007BFF" />
          </View>
          
          <Typography variant="h2" style={styles.uploadingTitle}>
            Enviando Documento
          </Typography>
          
          <Typography variant="body" style={styles.uploadingSubtitle}>
            {getEntityLabel()}
          </Typography>
          
          {/* Barra de progresso estilizada */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Typography variant="body" style={styles.progressText}>
              {progress}%
            </Typography>
          </View>
          
          {/* Mensagem de status */}
          <View style={styles.statusMessageContainer}>
            <ActivityIndicator size="small" color="#007BFF" style={styles.statusLoader} />
            <Typography variant="body" style={styles.statusMessage}>
              {progressMessage || 'Processando...'}
            </Typography>
          </View>
          
          <Typography variant="caption" style={styles.uploadingNote}>
            Isso pode levar alguns instantes...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  // Estado de sucesso
  if (uploadSuccess) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.resultContainer}>
          <View style={styles.successIconCircle}>
            <MaterialIcons name="check-circle" size={100} color="#4CAF50" />
          </View>
          
          <Typography variant="h1" style={styles.successTitle}>
            Documento Enviado!
          </Typography>
          
          <Typography variant="body" style={styles.successMessage}>
            O documento de <Typography style={styles.entityHighlight}>{getEntityLabel()}</Typography> foi digitalizado e enviado com sucesso.
          </Typography>

          {/* Card de informação */}
          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color="#007BFF" style={styles.infoIcon} />
            <Typography variant="caption" style={styles.infoText}>
              O documento já está disponível no sistema e pode ser acessado a qualquer momento.
            </Typography>
          </View>

          <View style={styles.actionsContainer}>
            <Button
              title="Digitalizar Outro Documento"
              onPress={handleScanAnother}
              style={styles.primaryButton}
            />
            <Button
              title="Voltar ao Início"
              onPress={handleFinish}
              variant="outline"
              style={styles.secondaryButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Estado de erro
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.resultContainer}>
        <View style={styles.errorIconCircle}>
          <MaterialIcons name="error" size={100} color="#F44336" />
        </View>
        
        <Typography variant="h1" style={styles.resultTitle}>
          Erro no Envio
        </Typography>
        
        <Typography variant="body" style={styles.resultMessage}>
          {errorMessage}
        </Typography>

        <View style={styles.actionsContainer}>
          {isSessionExpired ? (
            // Se sessão expirou, mostrar botão de login
            <Button
              title="Fazer Login"
              onPress={handleGoToLogin}
              style={styles.button}
            />
          ) : (
            // Se foi outro erro, permitir tentar novamente
            <>
              <Button
                title="Tentar Novamente"
                onPress={() => {
                  setUploadComplete(false);
                  handleUpload();
                }}
                variant="outline"
                style={styles.button}
              />
              <Button
                title="Voltar ao Início"
                onPress={handleFinish}
                style={styles.button}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadingTitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  uploadingSubtitle: {
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007BFF',
    borderRadius: 6,
  },
  progressText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#007BFF',
  },
  statusMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  statusLoader: {
    marginRight: 4,
  },
  statusMessage: {
    flex: 1,
    color: '#007BFF',
    fontWeight: '500',
  },
  uploadingNote: {
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 16,
  },
  
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 32,
  },
  successIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  successTitle: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#4CAF50',
  },
  successMessage: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 24,
    paddingHorizontal: 16,
    lineHeight: 24,
    fontSize: 16,
  },
  entityHighlight: {
    fontWeight: '700',
    color: '#007BFF',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007BFF',
    marginBottom: 32,
    width: '100%',
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
    color: '#1565C0',
  },
  resultMessage: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 8,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
});
