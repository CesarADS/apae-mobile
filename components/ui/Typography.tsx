import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'link';
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'default';
  align?: 'left' | 'center' | 'right';
}

export const Typography: React.FC<TypographyProps> = ({ 
  variant = 'body',
  color = 'default',
  align = 'left',
  style,
  children,
  ...props 
}) => {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        styles[color],
        styles[align],
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
  
  // Variants
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  link: {
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  
  // Colors
  primary: {
    color: '#007BFF',
  },
  secondary: {
    color: '#666666',
  },
  error: {
    color: '#FF3333',
  },
  success: {
    color: '#28A745',
  },
  default: {
    color: '#222222',
  },
  
  // Alignment
  left: {
    textAlign: 'left',
  },
  center: {
    textAlign: 'center',
  },
  right: {
    textAlign: 'right',
  },
});