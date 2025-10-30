import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps
} from 'react-native';
import { Colors } from '../../constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({ 
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  style,
  textStyle,
  ...props 
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    (disabled || loading) && styles.disabled,
    style
  ];

  const titleStyle = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? Colors.primary : Colors.white} 
          size="small"
        />
      ) : (
        <Text style={titleStyle} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 2,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: Colors.primary,
  },
  
  // Sizes
  small: {
    height: 36,
    paddingHorizontal: 12,
    minWidth: 100,
  },
  medium: {
    height: 48,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  large: {
    height: 56,
    paddingHorizontal: 32,
    minWidth: 140,
  },
  
  // States
  disabled: {
    backgroundColor: Colors.background,
    borderColor: Colors.disabled,
  },
  
  // Text styles
  baseText: {
    fontWeight: "bold",
  },
  primaryText: {
    color: Colors.primary,
    fontSize: 18,
  },
  secondaryText: {
    color: Colors.white,
    fontSize: 18,
  },
  outlineText: {
    color: Colors.primary,
    fontSize: 18,
  },
  
  // Text sizes
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  disabledText: {
    color: Colors.textLight,
  },
});