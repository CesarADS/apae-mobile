import { Typography } from '@/components';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function TestFormScreen() {
  const params = useLocalSearchParams();
  
  return (
    <View style={styles.container}>
      <Typography variant="h1">TELA DE TESTE</Typography>
      <Typography variant="body">Params recebidos:</Typography>
      <Typography variant="caption">{JSON.stringify(params, null, 2)}</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
