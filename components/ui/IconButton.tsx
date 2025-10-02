import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps
} from 'react-native';

interface IconButtonProps extends TouchableOpacityProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: string;
  variant?: 'default' | 'circle' | 'square';
  backgroundColor?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  iconName,
  size = 24,
  color = '#007BFF',
  variant = 'default',
  backgroundColor,
  style,
  ...props 
}) => {
  const buttonStyle = [
    styles.base,
    variant === 'circle' && styles.circle,
    variant === 'square' && styles.square,
    backgroundColor && { backgroundColor },
    style
  ].filter(Boolean);

  return (
    <TouchableOpacity style={buttonStyle} {...props}>
      <MaterialIcons name={iconName} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  circle: {
    borderRadius: 50,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  square: {
    borderRadius: 8,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
});