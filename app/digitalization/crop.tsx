import { Button, Container, Typography } from '@/components';
import { EntityType } from '@/types';
import * as ImageManipulator from 'expo-image-manipulator';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Platform, StyleSheet, View } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function CropScreen() {
  const router = useRouter();
  const { entityType, formData, imageUri, existingPages } = useLocalSearchParams<{
    entityType: EntityType;
    formData: string;
    imageUri: string;
    existingPages?: string;
  }>();

  const [processing, setProcessing] = useState(false);
  const [editedImageUri, setEditedImageUri] = useState<string>(imageUri);

  const handleEditImage = async () => {
    try {
      setProcessing(true);

      // Abrir editor nativo de crop
      const croppedImage = await ImagePicker.openCropper({
        path: editedImageUri.replace('file://', ''), // Remove file:// prefix
        freeStyleCropEnabled: true,
        cropperToolbarTitle: 'Recortar Documento',
        cropperToolbarColor: '#1976d2',
        cropperToolbarWidgetColor: '#fff',
        cropperActiveWidgetColor: '#1976d2',
        hideBottomControls: false,
        enableRotationGesture: true,
        compressImageQuality: 1,
        mediaType: 'photo',
        includeBase64: false,
      });

      // Converter path para URI com file://
      const newUri = Platform.OS === 'android' 
        ? `file://${croppedImage.path}`
        : croppedImage.path;

      setEditedImageUri(newUri);
      setProcessing(false);
      Alert.alert('✅ Sucesso', 'Imagem recortada com sucesso!');
    } catch (error: any) {
      setProcessing(false);
      
      // Usuário cancelou
      if (error.code === 'E_PICKER_CANCELLED') {
        console.log('Crop cancelado pelo usuário');
        return;
      }

      console.error('Erro ao recortar:', error);
      Alert.alert('Erro', 'Não foi possível abrir o editor de recorte');
    }
  };

  const handleCrop = async () => {
    if (!editedImageUri) {
      Alert.alert('Erro', 'Imagem não encontrada');
      return;
    }

    setProcessing(true);

    try {
      // Processar a imagem: auto-crop e ajuste de qualidade
      const manipResult = await ImageManipulator.manipulateAsync(
        editedImageUri,
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

      // Juntar com páginas existentes se houver
      const currentPages = existingPages ? JSON.parse(existingPages) : [];
      const newPages = [
        ...currentPages,
        {
          uri: manipResult.uri,
          base64: manipResult.base64,
        },
      ];

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
    } finally {
      setProcessing(false);
    }
  };

  const handleRetake = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Container>
        <View style={styles.header}>
          <Typography variant="h2">Ajustar Imagem</Typography>
          <Typography variant="body" style={styles.subtitle}>
            A imagem será automaticamente ajustada para melhor qualidade
          </Typography>
        </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: editedImageUri }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.footer}>
        <Button
          title="Recortar"
          onPress={handleEditImage}
          variant="outline"
          style={styles.button}
          disabled={processing}
        />
        <Button
          title="Tirar Outra"
          onPress={handleRetake}
          variant="outline"
          style={styles.button}
          disabled={processing}
        />
        <Button
          title={processing ? 'Processando...' : 'Confirmar'}
          onPress={handleCrop}
          style={styles.button}
          disabled={processing}
        />
      </View>
    </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
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
    marginBottom: 24,
  },
  image: {
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
