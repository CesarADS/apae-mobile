import { Typography } from '@/components';
import { EntityType } from '@/types';
import * as ImageManipulator from 'expo-image-manipulator';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CameraScreen() {
  const router = useRouter();
  const { entityType, formData, existingPages } = useLocalSearchParams<{
    entityType: EntityType;
    formData: string;
    existingPages?: string;
  }>();

  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Abrir scanner automaticamente ao montar o componente
  useEffect(() => {
    openScanner();
  }, []);

  const openScanner = async () => {
    if (isScanning) return;
    
    try {
      setIsScanning(true);
      console.log('Abrindo scanner de documentos...');
      
      // Abrir scanner com detecção automática de bordas
      const { scannedImages } = await DocumentScanner.scanDocument({
        maxNumDocuments: 1, // Captura 1 documento por vez
        croppedImageQuality: 100, // Qualidade máxima
      });

      console.log('Resultado do scanner:', scannedImages);

      if (scannedImages && scannedImages.length > 0) {
        const scannedImageUri = scannedImages[0];
        console.log('Documento escaneado:', scannedImageUri);
        
        // Normalizar URI para diferentes plataformas
        const normalizedUri = Platform.OS === 'android' && !scannedImageUri.startsWith('file://')
          ? `file://${scannedImageUri}`
          : scannedImageUri;
        
        // Processar e ir direto para páginas
        await processAndNavigate(normalizedUri);
      } else {
        console.log('Escaneamento cancelado');
        // Se cancelou, volta para tela anterior
        router.back();
      }
    } catch (error) {
      console.error('Erro ao escanear documento:', error);
      Alert.alert(
        'Erro',
        'Não foi possível escanear o documento. Verifique as permissões da câmera.',
        [
          { text: 'Cancelar', onPress: () => router.back() },
          { text: 'Tentar Novamente', onPress: openScanner }
        ]
      );
    } finally {
      setIsScanning(false);
    }
  };

  const processAndNavigate = async (imageUri: string) => {
    try {
      console.log('[processAndNavigate] Iniciando processamento da imagem:', imageUri);
      setIsProcessing(true);

      // Verificar se a URI é válida
      if (!imageUri) {
        throw new Error('URI da imagem inválida');
      }

      console.log('[processAndNavigate] Manipulando imagem...');
      
      // Processar a imagem: redimensionar e comprimir (SEM base64)
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          // Redimensionar se muito grande (max 2000px de largura)
          { resize: { width: 2000 } },
        ],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false, // NÃO gera base64 aqui (muito lento)
        }
      );

      console.log('[processAndNavigate] Imagem processada:', manipResult.uri);

      // Juntar com páginas existentes se houver
      const currentPages = existingPages ? JSON.parse(existingPages) : [];
      console.log('[processAndNavigate] Páginas existentes:', currentPages.length);
      
      const newPages = [
        ...currentPages,
        {
          uri: manipResult.uri,
        },
      ];

      console.log('[processAndNavigate] Total de páginas:', newPages.length);
      console.log('[processAndNavigate] Navegando para pages...');

      // Navegar diretamente para pages
      router.push({
        pathname: './pages' as any,
        params: {
          entityType,
          formData,
          pages: JSON.stringify(newPages),
        },
      });
      
      console.log('[processAndNavigate] Navegação concluída');
    } catch (error) {
      console.error('[processAndNavigate] Erro ao processar imagem:', error);
      setIsProcessing(false);
      Alert.alert('Erro', 'Não foi possível processar a imagem', [
        { text: 'Cancelar', onPress: () => router.back() },
        { text: 'Tentar Novamente', onPress: openScanner }
      ]);
    }
  };

  // Mostra loading enquanto processa
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.cameraInstructionsContainer}>
        <Typography>
          {isScanning 
            ? 'Abrindo scanner de documentos...' 
            : isProcessing 
            ? 'Processando imagem...' 
            : 'Aguarde...'}
        </Typography>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
  },
  cameraInstructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
});
