import { Button, Container, Typography } from '@/components';
import { EntityType } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CameraScreen() {
  const router = useRouter();
  const { entityType, formData, existingPages } = useLocalSearchParams<{
    entityType: EntityType;
    formData: string;
    existingPages?: string;
  }>();

  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Verificar permissões
  if (!permission) {
    return (
      <Container>
        <Typography>Carregando câmera...</Typography>
      </Container>
    );
  }

  if (!permission.granted) {
    return (
      <Container>
        <View style={styles.permissionContainer}>
          <Typography variant="h2" style={styles.permissionTitle}>
            Permissão de Câmera
          </Typography>
          <Typography style={styles.permissionText}>
            Precisamos de acesso à câmera para digitalizar documentos.
          </Typography>
          <Button title="Conceder Permissão" onPress={requestPermission} />
        </View>
      </Container>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Erro', 'Câmera não disponível');
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
        skipProcessing: false,
      });

      if (photo) {
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      console.error('Erro ao capturar:', error);
      Alert.alert('Erro', 'Não foi possível capturar a imagem');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleContinue = () => {
    if (!capturedImage) {
      Alert.alert('Erro', 'Nenhuma imagem capturada');
      return;
    }

    // Se existem páginas anteriores, navegar direto para crop e depois pages
    // Caso contrário, navegar para crop normalmente
    router.push({
      pathname: './crop' as any,
      params: {
        entityType,
        formData,
        imageUri: capturedImage,
        existingPages: existingPages || undefined,
      },
    });
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Se já capturou, mostra preview
  if (capturedImage) {
    return (
      <Container>
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
      </Container>
    );
  }

  // Modo de captura
  return (
    <View style={styles.fullscreen}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Overlay com guias A4 */}
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />
            <View style={styles.frameGuide}>
              {/* Cantos do frame */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              <Typography variant="caption" style={styles.guideText}>
                Posicione o documento dentro do quadro
              </Typography>
            </View>
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay}>
            <View style={styles.controls}>
              <TouchableOpacity
                onPress={toggleCameraFacing}
                style={styles.controlButton}
              >
                <MaterialIcons name="flip-camera-android" size={32} color="#FFF" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleCapture} style={styles.captureButton}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.controlButton}
              >
                <MaterialIcons name="close" size={32} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    aspectRatio: 1 / 1.414, // Proporção A4
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  frameGuide: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  guideText: {
    color: '#FFF',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#007BFF',
  },
  
  // Estilos de preview
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  permissionTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
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
