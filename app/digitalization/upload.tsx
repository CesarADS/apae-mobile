import { Button, Container, Typography } from '@/components';
import { useDocumentUpload } from '@/hooks';
import { CapturedPage, EntityType } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

export default function UploadScreen() {
  const router = useRouter();
  const { entityType, formData: formDataParam, pages: pagesParam } = useLocalSearchParams<{
    entityType: EntityType;
    formData: string;
    pages: string;
  }>();

  const { uploadDocument, uploading, progress } = useDocumentUpload();
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

  const handleScanAnother = () => {
    // Voltar para a seleção de entidade
    router.replace('./select-entity' as any);
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
      <Container>
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Typography variant="h2" style={styles.uploadingTitle}>
            Enviando Documento
          </Typography>
          <Typography variant="body" style={styles.uploadingSubtitle}>
            {getEntityLabel()} • {progress}%
          </Typography>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Typography variant="caption" style={styles.uploadingNote}>
            Isso pode levar alguns instantes...
          </Typography>
        </View>
      </Container>
    );
  }

  // Estado de sucesso
  if (uploadSuccess) {
    return (
      <Container>
        <View style={styles.resultContainer}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
          </View>
          
          <Typography variant="h1" style={styles.resultTitle}>
            Sucesso!
          </Typography>
          
          <Typography variant="body" style={styles.resultMessage}>
            O documento foi digitalizado e enviado com sucesso.
          </Typography>

          <View style={styles.actionsContainer}>
            <Button
              title="Digitalizar Outro"
              onPress={handleScanAnother}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Voltar ao Início"
              onPress={handleFinish}
              style={styles.button}
            />
          </View>
        </View>
      </Container>
    );
  }

  // Estado de erro
  return (
    <Container>
      <View style={styles.resultContainer}>
        <View style={styles.errorIcon}>
          <MaterialIcons name="error" size={80} color="#F44336" />
        </View>
        
        <Typography variant="h1" style={styles.resultTitle}>
          Erro no Envio
        </Typography>
        
        <Typography variant="body" style={styles.resultMessage}>
          {errorMessage}
        </Typography>

        <View style={styles.actionsContainer}>
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
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  uploadingTitle: {
    marginTop: 24,
    textAlign: 'center',
  },
  uploadingSubtitle: {
    opacity: 0.7,
    textAlign: 'center',
  },
  uploadingNote: {
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007BFF',
    borderRadius: 4,
  },
  
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  successIcon: {
    marginBottom: 16,
  },
  errorIcon: {
    marginBottom: 16,
  },
  resultTitle: {
    textAlign: 'center',
  },
  resultMessage: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
