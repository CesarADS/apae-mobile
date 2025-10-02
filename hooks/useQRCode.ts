import { useState } from 'react';
import { Alert } from 'react-native';

interface QRCodeState {
  visible: boolean;
  scanned: boolean;
  error: string | null;
}

interface QRCodeData {
  email: string;
  password: string;
}

export const useQRCode = () => {
  const [state, setState] = useState<QRCodeState>({
    visible: false,
    scanned: false,
    error: null,
  });

  const openScanner = () => {
    setState(prev => ({
      ...prev,
      visible: true,
      scanned: false,
      error: null,
    }));
  };

  const closeScanner = () => {
    setState(prev => ({
      ...prev,
      visible: false,
      scanned: false,
      error: null,
    }));
  };

  const handleScan = (data: string): QRCodeData | null => {
    if (state.scanned) return null;
    
    setState(prev => ({ ...prev, scanned: true }));
    
    try {
      const payload = JSON.parse(data) as QRCodeData;
      
      if (!payload.email || !payload.password) {
        setState(prev => ({
          ...prev,
          error: 'QR Code não contém email e senha válidos',
        }));
        
        Alert.alert('QR Code inválido', 'O QR Code não contém email e senha.');
        
        // Reset scanned state after delay
        setTimeout(() => {
          setState(prev => ({ ...prev, scanned: false }));
        }, 1000);
        
        return null;
      }

      // Close scanner on successful scan
      closeScanner();
      
      return payload;
    } catch {
      setState(prev => ({
        ...prev,
        error: 'Não foi possível ler os dados do QR Code',
      }));
      
      Alert.alert('QR Code inválido', 'Não foi possível ler os dados do QR Code.');
      
      // Reset scanned state after delay
      setTimeout(() => {
        setState(prev => ({ ...prev, scanned: false }));
      }, 1000);
      
      return null;
    }
  };

  return {
    ...state,
    openScanner,
    closeScanner,
    handleScan,
  };
};