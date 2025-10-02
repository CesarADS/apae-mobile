import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Typography } from '../ui';

interface QRCodeScannerProps {
  visible: boolean;
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  visible,
  onScan,
  onClose,
  title = "Escaneie o QR Code",
  subtitle = "Posicione o QR Code dentro da área de captura"
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible, permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
    setTimeout(() => setScanned(false), 1000);
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Typography variant="h3" color="primary" align="center" style={styles.title}>
          {title}
        </Typography>
        
        <Typography variant="body" color="secondary" align="center" style={styles.subtitle}>
          {subtitle}
        </Typography>

        <View style={styles.cameraContainer}>
          {!permission ? (
            <Typography variant="body" align="center">
              Solicitando permissão para acessar a câmera...
            </Typography>
          ) : !permission.granted ? (
            <Typography variant="body" align="center" color="error">
              Permissão para câmera negada
            </Typography>
          ) : (
            <>
              <CameraView
                style={styles.camera}
                onBarcodeScanned={handleBarCodeScanned}
                facing="back"
              />
              <View style={styles.overlay}>
                <View style={styles.scanArea} />
              </View>
            </>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title="Fechar"
            variant="outline"
            onPress={() => {
              onClose();
              setScanned(false);
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  cameraContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#007BFF',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  actions: {
    width: '100%',
  },
});