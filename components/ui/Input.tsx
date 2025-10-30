import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { Colors } from '../../constants/colors';

interface InputProps extends TextInputProps {
  variant?: 'default' | 'outlined';
}

export const Input: React.FC<InputProps> = ({ 
  style, 
  variant = 'default', 
  ...props 
}) => {
  return (
    <TextInput
      style={[
        styles.base,
        variant === 'outlined' && styles.outlined,
        style
      ]}
      placeholderTextColor={Colors.textLight}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    width: "100%",
    maxWidth: "100%",
    height: 48,
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontSize: 16,
    textAlignVertical: 'center',
    flexShrink: 1,
    minWidth: 0,
  },
  outlined: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
});