import { Typography } from '@/components';
import { EntityType } from '@/types';
import * as ImageManipulator from 'expo-image-manipulator';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Platform, StyleSheet, View } from 'react-native';
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
  const isMounted = useRef(true);
  const appState = useRef(AppState.currentState);

  // Abrir scanner automaticamente ao montar o componente
  useEffect(() => {
    isMounted.current = true;
    
    // Pequeno delay para garantir que o componente está montado
    const timer = setTimeout(() => {
      if (isMounted.current) {
        openScanner();
      }
    }, 300);

    // Listener para detectar se o app volta do background
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App voltou para foreground - pode ter voltado do scanner
        console.log('App voltou para foreground');
      }
      appState.current = nextAppState;
    });

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  const openScanner = async () => {
    if (isScanning || !isMounted.current) return;
    
    try {
      setIsScanning(true);
      console.log('[Scanner] Abrindo scanner de documentos...');
      
      // Abrir scanner com detecção automática de bordas e compressão
      const { scannedImages } = await DocumentScanner.scanDocument({
        maxNumDocuments: 1, // Captura 1 documento por vez
        croppedImageQuality: 70, // 70% de qualidade (reduz tamanho significativamente)
      });

      console.log('[Scanner] Resultado do scanner:', scannedImages);

      // Verificar se o componente ainda está montado
      if (!isMounted.current) {
        console.log('[Scanner] Componente desmontado, cancelando processamento');
        return;
      }

      if (scannedImages && scannedImages.length > 0) {
        const scannedImageUri = scannedImages[0];
        console.log('[Scanner] Documento escaneado:', scannedImageUri);
        
        // Normalizar URI para diferentes plataformas
        const normalizedUri = Platform.OS === 'android' && !scannedImageUri.startsWith('file://')
          ? `file://${scannedImageUri}`
          : scannedImageUri;
        
        // Processar e ir direto para páginas
        await processAndNavigate(normalizedUri);
      } else {
        console.log('[Scanner] Escaneamento cancelado pelo usuário');
        // Se cancelou, volta para tela anterior
        if (isMounted.current) {
          router.back();
        }
      }
    } catch (error: any) {
      console.error('[Scanner] Erro ao escanear documento:', error);
      console.error('[Scanner] Stack trace:', error.stack);
      
      if (!isMounted.current) return;
      
      // Tratamento específico de erros
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('permission')) {
        Alert.alert(
          'Permissão Necessária',
          'O aplicativo precisa de permissão para usar a câmera.',
          [
            { text: 'Cancelar', onPress: () => router.back() },
            { text: 'Tentar Novamente', onPress: openScanner }
          ]
        );
      } else if (errorMessage.includes('camera')) {
        Alert.alert(
          'Erro na Câmera',
          'Não foi possível acessar a câmera. Verifique se outro aplicativo não está usando.',
          [
            { text: 'Cancelar', onPress: () => router.back() },
            { text: 'Tentar Novamente', onPress: openScanner }
          ]
        );
      } else {
        Alert.alert(
          'Erro',
          'Não foi possível escanear o documento. Tente novamente.',
          [
            { text: 'Cancelar', onPress: () => router.back() },
            { text: 'Tentar Novamente', onPress: openScanner }
          ]
        );
      }
    } finally {
      if (isMounted.current) {
        setIsScanning(false);
      }
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

      // Verificar se o componente ainda está montado
      if (!isMounted.current) {
        console.log('[processAndNavigate] Componente desmontado, cancelando');
        return;
      }

      console.log('[processAndNavigate] Manipulando imagem...');
      
      // Processar a imagem: redimensionar levemente (SEM compressão adicional aqui)
      // O scanner já comprimiu para 70%, não precisamos comprimir novamente
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          // Redimensionar moderadamente (max 1500px ao invés de 2000px)
          { resize: { width: 1500 } },
        ],
        {
          compress: 1.0, // Sem compressão adicional (scanner já fez isso)
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false, // NÃO gera base64 aqui (economiza memória)
        }
      );

      console.log('[processAndNavigate] Imagem processada:', manipResult.uri);

      // Verificar novamente se está montado
      if (!isMounted.current) {
        console.log('[processAndNavigate] Componente desmontado após processamento');
        return;
      }

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
    } catch (error: any) {
      console.error('[processAndNavigate] Erro ao processar imagem:', error);
      console.error('[processAndNavigate] Stack trace:', error.stack);
      
      if (!isMounted.current) return;
      
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
