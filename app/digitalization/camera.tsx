import { Button, Typography } from '@/components';
import { EntityType } from '@/types';
import * as ImageManipulator from 'expo-image-manipulator';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, StyleSheet, View } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CameraScreen() {
  const router = useRouter();
  const { entityType, formData, existingPages } = useLocalSearchParams<{
    entityType: EntityType;
    formData: string;
    existingPages?: string;
  }>();

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

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
          
        setCapturedImage(normalizedUri);
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

  const handleRetake = () => {
    setCapturedImage(null);
    openScanner();
  };

  const handleContinue = async () => {
    try {
      console.log('handleContinue chamado, capturedImage:', capturedImage);
      
      if (!capturedImage) {
        Alert.alert('Erro', 'Nenhuma imagem capturada');
        return;
      }

      // Processar a imagem: redimensionar e comprimir (SEM base64)
      const manipResult = await ImageManipulator.manipulateAsync(
        capturedImage,
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

      // Juntar com páginas existentes se houver
      const currentPages = existingPages ? JSON.parse(existingPages) : [];
      const newPages = [
        ...currentPages,
        {
          uri: manipResult.uri,
          // base64 será gerado apenas no upload (em pages.tsx)
        },
      ];

      console.log('Navegando para pages com', newPages.length, 'páginas');

      // Navegar diretamente para pages
      router.push({
        pathname: './pages' as any,
        params: {
          entityType,
          formData,
          pages: JSON.stringify(newPages),
        },
      });
    } catch (error) {
      console.error('Erro em handleContinue:', error);
      Alert.alert('Erro', 'Não foi possível processar a imagem');
    }
  };

  // Se está escaneando
  if (isScanning) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.cameraInstructionsContainer}>
          <Typography>Abrindo scanner de documentos...</Typography>
        </View>
      </SafeAreaView>
    );
  }

  // Se já capturou, mostra preview
  if (capturedImage) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Typography variant="h2">Imagem Capturada</Typography>
          <Typography variant="body" style={styles.subtitle}>
            Confira se a imagem está legível
          </Typography>
        </View>

        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} resizeMode="contain" />
        </View>

        <View style={styles.footer}>
          <Button
            title="Tirar Outra"
            onPress={handleRetake}
            variant="outline"
            style={styles.button}
          />
          <Button
            title="Continuar"
            onPress={handleContinue}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Se não capturou ainda, não mostra nada 
  // (o scanner já foi aberto automaticamente)
  return null;
}

const styles = StyleSheet.create({
  // SafeAreaView
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
  },
  
  // Tela de instruções
  cameraInstructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  instructions: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  tipsList: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
  },
  openCameraButton: {
    width: '100%',
    marginBottom: 12,
  },
  cancelButton: {
    width: '100%',
  },
  
  // Preview
  header: {
    marginBottom: 24,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 8,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  preview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
