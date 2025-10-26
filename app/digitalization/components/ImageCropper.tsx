import { Button, Typography } from '@/components';
import React, { useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    PanResponder,
    StyleSheet,
    View
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_CROP_SIZE = 100;
const CORNER_SIZE = 40;

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

type CornerType = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';

export default function ImageCropper({ imageUri, onCropComplete, onCancel }: ImageCropperProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0, offsetX: 0, offsetY: 0 });
  const initialCropSize = SCREEN_WIDTH * 0.7;
  const [cropArea, setCropArea] = useState({
    x: (SCREEN_WIDTH - initialCropSize) / 2,
    y: (SCREEN_HEIGHT - initialCropSize) / 2,
    width: initialCropSize,
    height: initialCropSize,
  });

  const activeCorner = useRef<CornerType>('center');
  const initialCropPosition = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const cropAreaRef = useRef(cropArea);

  // Atualizar a ref sempre que cropArea mudar
  cropAreaRef.current = cropArea;

  // PanResponder para arrastar o centro (mover a área)
  const centerPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          activeCorner.current = 'center';
          initialCropPosition.current = { ...cropAreaRef.current };
        },
        onPanResponderMove: (_, gestureState) => {
          const newX = Math.max(
            displaySize.offsetX,
            Math.min(
              displaySize.offsetX + displaySize.width - initialCropPosition.current.width,
              initialCropPosition.current.x + gestureState.dx
            )
          );
          const newY = Math.max(
            displaySize.offsetY,
            Math.min(
              displaySize.offsetY + displaySize.height - initialCropPosition.current.height,
              initialCropPosition.current.y + gestureState.dy
            )
          );

          setCropArea({
            ...initialCropPosition.current,
            x: newX,
            y: newY,
          });
        },
      }),
    [displaySize]
  );

  // PanResponder para cantos (redimensionar)
  const createCornerPanResponder = (corner: CornerType) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        activeCorner.current = corner;
        initialCropPosition.current = { ...cropAreaRef.current };
      },
      onPanResponderMove: (_, gestureState) => {
        const initial = initialCropPosition.current;
        let newX = initial.x;
        let newY = initial.y;
        let newWidth = initial.width;
        let newHeight = initial.height;

        switch (corner) {
          case 'topLeft':
            newX = initial.x + gestureState.dx;
            newY = initial.y + gestureState.dy;
            newWidth = initial.width - gestureState.dx;
            newHeight = initial.height - gestureState.dy;
            break;
          case 'topRight':
            newY = initial.y + gestureState.dy;
            newWidth = initial.width + gestureState.dx;
            newHeight = initial.height - gestureState.dy;
            break;
          case 'bottomLeft':
            newX = initial.x + gestureState.dx;
            newWidth = initial.width - gestureState.dx;
            newHeight = initial.height + gestureState.dy;
            break;
          case 'bottomRight':
            newWidth = initial.width + gestureState.dx;
            newHeight = initial.height + gestureState.dy;
            break;
        }

        // Garantir tamanho mínimo
        if (newWidth < MIN_CROP_SIZE) {
          newWidth = MIN_CROP_SIZE;
          if (corner === 'topLeft' || corner === 'bottomLeft') {
            newX = initial.x + initial.width - MIN_CROP_SIZE;
          }
        }
        if (newHeight < MIN_CROP_SIZE) {
          newHeight = MIN_CROP_SIZE;
          if (corner === 'topLeft' || corner === 'topRight') {
            newY = initial.y + initial.height - MIN_CROP_SIZE;
          }
        }

        // Garantir que não ultrapasse os limites da tela
        if (newX < displaySize.offsetX) {
          newWidth += newX - displaySize.offsetX;
          newX = displaySize.offsetX;
        }
        if (newY < displaySize.offsetY) {
          newHeight += newY - displaySize.offsetY;
          newY = displaySize.offsetY;
        }
        if (newX + newWidth > displaySize.offsetX + displaySize.width) {
          newWidth = displaySize.offsetX + displaySize.width - newX;
        }
        if (newY + newHeight > displaySize.offsetY + displaySize.height) {
          newHeight = displaySize.offsetY + displaySize.height - newY;
        }

        setCropArea({
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        });
      },
    });
  };

  const topLeftPanResponder = useMemo(() => createCornerPanResponder('topLeft'), [displaySize]);
  const topRightPanResponder = useMemo(() => createCornerPanResponder('topRight'), [displaySize]);
  const bottomLeftPanResponder = useMemo(() => createCornerPanResponder('bottomLeft'), [displaySize]);
  const bottomRightPanResponder = useMemo(() => createCornerPanResponder('bottomRight'), [displaySize]);

  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    setImageSize({ width, height });

    // Calcular o tamanho real da imagem exibida (com contain)
    const imageAspect = width / height;
    const screenAspect = SCREEN_WIDTH / SCREEN_HEIGHT;

    let displayWidth = SCREEN_WIDTH;
    let displayHeight = SCREEN_HEIGHT;
    let offsetX = 0;
    let offsetY = 0;

    if (imageAspect > screenAspect) {
      // Imagem mais larga que a tela - limitada pela largura
      displayWidth = SCREEN_WIDTH;
      displayHeight = SCREEN_WIDTH / imageAspect;
      offsetY = (SCREEN_HEIGHT - displayHeight) / 2;
    } else {
      // Imagem mais alta que a tela - limitada pela altura
      displayHeight = SCREEN_HEIGHT;
      displayWidth = SCREEN_HEIGHT * imageAspect;
      offsetX = (SCREEN_WIDTH - displayWidth) / 2;
    }

    setDisplaySize({ width: displayWidth, height: displayHeight, offsetX, offsetY });

    // Reposicionar a área de crop inicial dentro dos limites da imagem exibida
    const newCropSize = Math.min(displayWidth, displayHeight) * 0.7;
    setCropArea({
      x: offsetX + (displayWidth - newCropSize) / 2,
      y: offsetY + (displayHeight - newCropSize) / 2,
      width: newCropSize,
      height: newCropSize,
    });
  };

  const handleCrop = () => {
    // Ajustar as coordenadas do crop para considerar o offset da imagem
    const cropX = Math.max(0, cropArea.x - displaySize.offsetX);
    const cropY = Math.max(0, cropArea.y - displaySize.offsetY);
    
    // Garantir que o crop não ultrapasse os limites da imagem exibida
    const cropWidth = Math.min(cropArea.width, displaySize.width - cropX);
    const cropHeight = Math.min(cropArea.height, displaySize.height - cropY);

    // Calcular as coordenadas proporcionais da imagem original
    const scaleX = imageSize.width / displaySize.width;
    const scaleY = imageSize.height / displaySize.height;

    const cropData: CropData = {
      originX: Math.round(Math.max(0, cropX * scaleX)),
      originY: Math.round(Math.max(0, cropY * scaleY)),
      width: Math.round(cropWidth * scaleX),
      height: Math.round(cropHeight * scaleY),
    };

    onCropComplete(cropData);
  };

  return (
    <View style={styles.container}>
      {/* Imagem de fundo */}
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="contain"
        onLoad={handleImageLoad}
      />

      {/* Overlay escuro */}
      <View style={styles.overlay}>
        {/* Top overlay */}
        <View style={[styles.darkOverlay, { height: cropArea.y }]} />
        
        {/* Middle row */}
        <View style={{ flexDirection: 'row', height: cropArea.height }}>
          <View style={[styles.darkOverlay, { width: cropArea.x }]} />
          
          {/* Área de recorte */}
          <View
            style={[
              styles.cropArea,
              {
                width: cropArea.width,
                height: cropArea.height,
              },
            ]}
          >
            {/* Borda da área */}
            <View style={styles.cropBorder} />

            {/* Área central arrastável */}
            <View style={styles.centerDragArea} {...centerPanResponder.panHandlers} />

            {/* Cantos redimensionáveis */}
            <View
              style={[styles.cornerHandle, styles.topLeft]}
              {...topLeftPanResponder.panHandlers}
            >
              <View style={styles.cornerIndicator} />
            </View>
            
            <View
              style={[styles.cornerHandle, styles.topRight]}
              {...topRightPanResponder.panHandlers}
            >
              <View style={styles.cornerIndicator} />
            </View>
            
            <View
              style={[styles.cornerHandle, styles.bottomLeft]}
              {...bottomLeftPanResponder.panHandlers}
            >
              <View style={styles.cornerIndicator} />
            </View>
            
            <View
              style={[styles.cornerHandle, styles.bottomRight]}
              {...bottomRightPanResponder.panHandlers}
            >
              <View style={styles.cornerIndicator} />
            </View>
            
            <Typography variant="caption" style={styles.guideText}>
              Arraste os cantos para redimensionar
            </Typography>
          </View>
          
          <View style={[styles.darkOverlay, { flex: 1 }]} />
        </View>
        
        {/* Bottom overlay */}
        <View style={[styles.darkOverlay, { flex: 1 }]} />
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        <Button
          title="Cancelar"
          onPress={onCancel}
          variant="outline"
          style={styles.button}
        />
        <Button
          title="Recortar"
          onPress={handleCrop}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  darkOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  cropArea: {
    position: 'relative',
  },
  cropBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  centerDragArea: {
    ...StyleSheet.absoluteFillObject,
    margin: CORNER_SIZE / 2,
  },
  cornerHandle: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerIndicator: {
    width: 30,
    height: 30,
    borderColor: '#4CAF50',
    borderWidth: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  topLeft: {
    top: -CORNER_SIZE / 2,
    left: -CORNER_SIZE / 2,
  },
  topRight: {
    top: -CORNER_SIZE / 2,
    right: -CORNER_SIZE / 2,
  },
  bottomLeft: {
    bottom: -CORNER_SIZE / 2,
    left: -CORNER_SIZE / 2,
  },
  bottomRight: {
    bottom: -CORNER_SIZE / 2,
    right: -CORNER_SIZE / 2,
  },
  guideText: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    color: '#FFF',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
