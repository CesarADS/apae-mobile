import React from 'react';
import { Keyboard, Platform, Modal as RNModal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Typography } from '../ui';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number;
  dismissOnBackdrop?: boolean;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  title,
  children,
  maxWidth = 360,
  dismissOnBackdrop = true,
}) => {
  return (
    <RNModal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissOnBackdrop ? onClose : undefined}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={[styles.container, { maxWidth }]}> 
              {title && (
                <Typography variant="h3" color="primary" align="center" style={styles.title}>
                  {title}
                </Typography>
              )}
              <View style={styles.body}>{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    ...Platform.select({
      android: { elevation: 6 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      }
    })
  },
  title: {
    marginBottom: 16,
  },
  body: {
    width: '100%',
  }
});
