import React from 'react';
import { Modal as RNModal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Container, Typography } from '../ui';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  closeButtonText?: string;
  width?: number | `${number}%`;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  closeButtonText = "Fechar",
  width = '80%'
}) => {
  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <Container 
            variant="modal"
            style={[styles.modalContent, { width }]}
          >
            {title && (
              <Typography 
                variant="h3" 
                color="primary" 
                align="center" 
                style={styles.title}
              >
                {title}
              </Typography>
            )}
            
            {subtitle && (
              <Typography 
                variant="body" 
                color="secondary" 
                align="center" 
                style={styles.subtitle}
              >
                {subtitle}
              </Typography>
            )}

            <View style={styles.body}>{children}</View>

            {showCloseButton && (
              <View style={styles.actions}>
                <Button
                  title={closeButtonText}
                  variant="outline"
                  onPress={onClose}
                  size="small"
                />
              </View>
            )}
          </Container>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    maxHeight: '80%',
    minWidth: 300,
    maxWidth: '90%',
    width: '85%',
    padding: 20,
  },
  title: {
    marginBottom: 16,
  },
  subtitle: {
    marginBottom: 20,
  },
  body: {
    width: '100%',
  },
  actions: {
    width: '100%',
    paddingHorizontal: 0,
  },
});