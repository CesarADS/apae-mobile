import React from 'react';
import {
    StyleSheet,
    View,
    ViewProps
} from 'react-native';

interface ContainerProps extends ViewProps {
  variant?: 'default' | 'card' | 'modal' | 'screen';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  shadow?: boolean;
  backgroundColor?: string;
}

export const Container: React.FC<ContainerProps> = ({ 
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  shadow = false,
  backgroundColor,
  style,
  children,
  ...props 
}) => {
  const containerStyle = [
    styles.base,
    styles[variant],
    styles[`padding_${padding}`],
    styles[`margin_${margin}`],
    shadow && styles.shadow,
    backgroundColor && { backgroundColor },
    style
  ].filter(Boolean);

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFF',
  },
  
  // Variants
  default: {
    backgroundColor: 'transparent',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modal: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    overflow: 'hidden',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  
  // Padding
  padding_none: {
    padding: 0,
  },
  padding_small: {
    padding: 8,
  },
  padding_medium: {
    padding: 16,
  },
  padding_large: {
    padding: 24,
  },
  
  // Margin
  margin_none: {
    margin: 0,
  },
  margin_small: {
    margin: 8,
  },
  margin_medium: {
    margin: 16,
  },
  margin_large: {
    margin: 24,
  },
  
  // Shadow
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});