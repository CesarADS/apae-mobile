import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps
} from 'react-native';

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
          color={variant === 'primary' ? '#007BFF' : '#007BFF'} 
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
    backgroundColor: "#FFF",
    borderColor: "#007BFF",
  },
  secondary: {
    backgroundColor: "#007BFF",
    borderColor: "#007BFF",
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: "#007BFF",
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
    backgroundColor: "#F5F5F5",
    borderColor: "#CCCCCC",
  },
  
  // Text styles
  baseText: {
    fontWeight: "bold",
  },
  primaryText: {
    color: "#007BFF",
    fontSize: 18,
  },
  secondaryText: {
    color: "#FFF",
    fontSize: 18,
  },
  outlineText: {
    color: "#007BFF",
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
    color: "#999999",
  },
});