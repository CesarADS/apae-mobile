import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

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
      placeholderTextColor="#999"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    width: "100%",
    height: 48,
    borderColor: "#007BFF",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
    color: "#222",
    fontSize: 16,
    textAlignVertical: 'center', // Para Android
  },
  outlined: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
});