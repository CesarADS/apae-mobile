import { Button, Typography } from '@/components';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageCropperProps {
  imageUri: string;
  onCropComplete: (cropData: CropData) => void;
  onCancel: () => void;
}

export interface CropData {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export default function ImageCropperSimple({ imageUri, onCropComplete, onCancel }: ImageCropperProps) {
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Posição e tamanho da área de crop (coordenadas relativas à imagem)
  const cropX = useSharedValue(0.1); // 10% from left
  const cropY = useSharedValue(0.1); // 10% from top
  const cropWidth = useSharedValue(0.8); // 80% of image width
  const cropHeight = useSharedValue(0.8); // 80% of image height

  const handleImageLayout = (event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setImageLayout({ width, height, x, y });
    
    // Get actual image dimensions
    Image.getSize(imageUri, (imgWidth, imgHeight) => {
      setImageDimensions({ width: imgWidth, height: imgHeight });
    });
  };

  const handleCrop = () => {
    const cropData: CropData = {
      originX: Math.round(cropX.value * imageDimensions.width),
      originY: Math.round(cropY.value * imageDimensions.height),
      width: Math.round(cropWidth.value * imageDimensions.width),
      height: Math.round(cropHeight.value * imageDimensions.height),
    };
    
    console.log('Crop data (relative):', { cropX: cropX.value, cropY: cropY.value, cropWidth: cropWidth.value, cropHeight: cropHeight.value });
    console.log('Crop data (absolute):', cropData);
    console.log('Image dimensions:', imageDimensions);
    console.log('Image layout:', imageLayout);
    
    onCropComplete(cropData);
  };

  // Animated style for crop area
  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: cropX.value * imageLayout.width,
      top: cropY.value * imageLayout.height,
      width: cropWidth.value * imageLayout.width,
      height: cropHeight.value * imageLayout.height,
      borderWidth: 2,
      borderColor: '#4CAF50',
      backgroundColor: 'transparent',
    };
  });

  // Gesture for moving crop area
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newX = cropX.value + e.translationX / imageLayout.width;
      const newY = cropY.value + e.translationY / imageLayout.height;
      
      // Limit to image bounds
      if (newX >= 0 && newX + cropWidth.value <= 1) {
        cropX.value = newX;
      }
      if (newY >= 0 && newY + cropHeight.value <= 1) {
        cropY.value = newY;
      }
    })
    .onEnd(() => {
      cropX.value = withSpring(cropX.value);
      cropY.value = withSpring(cropY.value);
    });

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2">Recortar Imagem</Typography>
        <Typography variant="caption" style={styles.instruction}>
          Arraste a área verde para ajustar o recorte
        </Typography>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
          onLayout={handleImageLayout}
        />
        
        {imageLayout.width > 0 && (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={animatedStyle}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
            </Animated.View>
          </GestureDetector>
        )}
      </View>

      <View style={styles.footer}>
        <Button title="Cancelar" onPress={onCancel} variant="secondary" style={styles.button} />
        <Button title="Aplicar Recorte" onPress={handleCrop} style={styles.button} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  instruction: {
    color: '#999',
    marginTop: 8,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#4CAF50',
  },
  cornerTopRight: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#4CAF50',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#4CAF50',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#4CAF50',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#1a1a1a',
  },
  button: {
    flex: 1,
  },
});
