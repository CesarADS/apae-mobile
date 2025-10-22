import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Container, Typography } from '../../components';
import { EntityType } from '../../types';

export default function SelectEntityScreen() {
  const handleSelectEntity = (entityType: EntityType) => {
    console.log('Selecionando entidade:', entityType);
    // Navegar para a tela de formulário passando o tipo de entidade
    router.push(`./form?entityType=${entityType}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Container style={styles.content}>
        <Typography variant="h2" color="primary" align="center" style={styles.title}>
          Digitalizar Documento
        </Typography>
        
        <Typography variant="body" color="secondary" align="center" style={styles.subtitle}>
          Selecione para qual entidade deseja digitalizar o documento:
        </Typography>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionCard, styles.alunoCard]}
            onPress={() => handleSelectEntity('aluno')}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Typography variant="h1" style={{ fontSize: 48 }}>
                🎓
              </Typography>
            </View>
            <Typography variant="h3" style={{ color: '#FFF' }} align="center">
              Aluno
            </Typography>
            <Typography variant="body" style={{ color: '#FFF', opacity: 0.9 }} align="center">
              Documentos pessoais de alunos
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, styles.colaboradorCard]}
            onPress={() => handleSelectEntity('colaborador')}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Typography variant="h1" style={{ fontSize: 48 }}>
                👔
              </Typography>
            </View>
            <Typography variant="h3" style={{ color: '#FFF' }} align="center">
              Colaborador
            </Typography>
            <Typography variant="body" style={{ color: '#FFF', opacity: 0.9 }} align="center">
              Documentos de colaboradores
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, styles.instituicaoCard]}
            onPress={() => handleSelectEntity('instituicao')}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Typography variant="h1" style={{ fontSize: 48 }}>
                🏛️
              </Typography>
            </View>
            <Typography variant="h3" style={{ color: '#FFF' }} align="center">
              Instituição
            </Typography>
            <Typography variant="body" style={{ color: '#FFF', opacity: 0.9 }} align="center">
              Documentos institucionais
            </Typography>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Typography variant="body" color="secondary">
            ← Voltar
          </Typography>
        </TouchableOpacity>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 16,
  },
  subtitle: {
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minHeight: 140,
    justifyContent: 'center',
  },
  alunoCard: {
    backgroundColor: '#007BFF',
  },
  colaboradorCard: {
    backgroundColor: '#28A745',
  },
  instituicaoCard: {
    backgroundColor: '#7B1FA2',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    marginTop: 32,
    padding: 12,
    alignSelf: 'center',
  },
});