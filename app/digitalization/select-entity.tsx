import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Container, Typography } from '../../components';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { EntityType } from '../../types';

export default function SelectEntityScreen() {
  const { data } = useAuth();
  
  // Obter permissões do usuário
  const userPermissions = data?.userPermissions;
  
  const handleSelectEntity = (entityType: EntityType) => {
    // Navegar para a tela de formulário passando o tipo de entidade
    router.push(`./form?entityType=${entityType}` as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Container style={styles.content}>
        <Typography variant="h2" color="primary" align="center" style={styles.title}>
          Digitalizar documento
        </Typography>
        
        <Typography variant="body" color="secondary" align="center" style={styles.subtitle}>
          Selecione para qual entidade deseja digitalizar o documento
        </Typography>

        <View style={styles.optionsContainer}>
          {/* Card Aluno - Só aparece se tiver permissão */}
          {userPermissions?.canAccessAluno && (
            <TouchableOpacity
              style={[styles.optionCard, styles.alunoCard]}
              onPress={() => handleSelectEntity('aluno')}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <MaterialIcons name="school" size={64} color="#FFFFFF" />
              </View>
              <Typography variant="h3" style={{ color: '#FFF' }} align="center">
                Aluno
              </Typography>
              <Typography variant="body" style={{ color: '#FFF', opacity: 0.9 }} align="center">
                Documentos pessoais de alunos
              </Typography>
            </TouchableOpacity>
          )}

          {/* Card Colaborador - Só aparece se tiver permissão */}
          {userPermissions?.canAccessColaborador && (
            <TouchableOpacity
              style={[styles.optionCard, styles.colaboradorCard]}
              onPress={() => handleSelectEntity('colaborador')}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <MaterialIcons name="badge" size={64} color="#FFFFFF" />
              </View>
              <Typography variant="h3" style={{ color: '#FFF' }} align="center">
                Colaborador
              </Typography>
              <Typography variant="body" style={{ color: '#FFF', opacity: 0.9 }} align="center">
                Documentos de colaboradores
              </Typography>
            </TouchableOpacity>
          )}

          {/* Card Instituição - Só aparece se tiver permissão */}
          {userPermissions?.canAccessInstituicao && (
            <TouchableOpacity
              style={[styles.optionCard, styles.instituicaoCard]}
              onPress={() => handleSelectEntity('instituicao')}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <MaterialIcons name="business" size={64} color="#FFFFFF" />
              </View>
              <Typography variant="h3" style={{ color: '#FFF' }} align="center">
                Instituição
              </Typography>
              <Typography variant="body" style={{ color: '#FFF', opacity: 0.9 }} align="center">
                Documentos institucionais
              </Typography>
            </TouchableOpacity>
          )}
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
    padding: 16, // Reduzido de 24 para 16
    justifyContent: 'center',
  },
  title: {
    marginBottom: 12, // Reduzido de 16
  },
  subtitle: {
    marginBottom: 32, // Reduzido de 40
    paddingHorizontal: 8,
  },
  optionsContainer: {
    gap: 16, // Reduzido de 20
  },
  optionCard: {
    borderRadius: 12, // Reduzido de 16
    padding: 20, // Reduzido de 24
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minHeight: 120, // Reduzido de 140
    justifyContent: 'center',
  },
  alunoCard: {
    backgroundColor: Colors.primary,
  },
  colaboradorCard: {
    backgroundColor: Colors.primaryDark,
  },
  instituicaoCard: {
    backgroundColor: Colors.accent,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8, // Reduzido de 12
  },
  backButton: {
    marginTop: 24, // Reduzido de 32
    padding: 12,
    alignSelf: 'center',
  },
});