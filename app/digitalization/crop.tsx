import { Button, Container, Typography } from '@/components';
import { EntityType } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CropScreen() {
  const router = useRouter();
  const { entityType, formData, imageUri, existingPages } = useLocalSearchParams<{
    entityType: EntityType;
    formData: string;
    imageUri: string;
    existingPages?: string;
  }>();

  console.log('CropScreen montado com params:', { entityType, formData, imageUri, existingPages });

  const [processing, setProcessing] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState<string>(imageUri);

  // Validação inicial
  if (!imageUri) {
    console.error('CropScreen: imageUri está vazio!');
    Alert.alert('Erro', 'Imagem não encontrada', [
      { text: 'Voltar', onPress: () => router.back() }
    ]);
    return null;
  }

  const handleConfirm = async () => {
    setProcessing(true);

    try {
      console.log('Processando imagem...');
      
      // Processar a imagem atual (pode ter sido rotacionada)
      const manipResult = await ImageManipulator.manipulateAsync(
        currentImageUri,
        [
          // Redimensionar se muito grande (max 2000px de largura)
          { resize: { width: 2000 } },
        ],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      console.log('Imagem processada com sucesso');

      // Juntar com páginas existentes se houver
      const currentPages = existingPages ? JSON.parse(existingPages) : [];
      const newPages = [
        ...currentPages,
        {
          uri: manipResult.uri,
          base64: manipResult.base64,
        },
      ];

      console.log('Navegando para pages com', newPages.length, 'páginas');

      // Navegar para a tela de gerenciamento de páginas
      router.push({
        pathname: './pages' as any,
        params: {
          entityType,
          formData,
          pages: JSON.stringify(newPages),
        },
      });
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      Alert.alert('Erro', 'Não foi possível processar a imagem');
      setProcessing(false);
    }
  };

  const handleRetake = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Container variant="screen">
        <View style={styles.header}>
          <Typography variant="h2">Revisar Documento</Typography>
          <Typography variant="body" style={styles.subtitle}>
            Confira se o documento está legível e bem posicionado
          </Typography>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentImageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleRetake}
            disabled={processing}
          >
            <MaterialIcons name="camera-alt" size={32} color="#007BFF" />
            <Typography style={styles.actionText}>Tirar Nova Foto</Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Button
            title={processing ? 'Processando...' : 'Continuar'}
            onPress={handleConfirm}
            disabled={processing}
          />
        </View>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    marginBottom: 16,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 8,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  footer: {
    gap: 12,
  },
});
