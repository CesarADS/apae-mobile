import { Button, Container, Typography } from '@/components';
import { EntityType } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Vamos importar os componentes de formulário específicos
import AlunoForm from './forms/AlunoForm';
import ColaboradorForm from './forms/ColaboradorForm';
import InstituicaoForm from './forms/InstituicaoForm';

export default function DigitalizationFormScreen() {
  const router = useRouter();
  const { entityType: entityTypeParam } = useLocalSearchParams<{ entityType?: string | string[] }>();

  // Normaliza o parâmetro (expo-router pode retornar string ou string[])
  const entityTypeRaw = Array.isArray(entityTypeParam) ? entityTypeParam[0] : entityTypeParam;
  const isEntityType = (v: any): v is EntityType => v === 'aluno' || v === 'colaborador' || v === 'instituicao';
  const entityType = isEntityType(entityTypeRaw) ? entityTypeRaw : undefined;

  // Debug: Log para verificar o entityType
  console.log('Form Screen - entityTypeParam:', entityTypeParam, 'normalized:', entityType);
  
  const [formData, setFormData] = useState<any>(null);
  const [isValid, setIsValid] = useState(false);

  const handleFormChange = (data: any, valid: boolean) => {
      console.log('Form changed - data:', data, 'valid:', valid);
    setFormData(data);
    setIsValid(valid);
  };

  const handleContinue = () => {
    if (!isValid || !formData) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Navega para a tela de captura com os dados do formulário
    router.push({
      pathname: './camera' as any,
      params: {
        entityType,
        formData: JSON.stringify(formData),
      },
    });
  };

  const getTitle = () => {
    switch (entityType) {
      case 'aluno':
        return 'Documento do Aluno';
      case 'colaborador':
        return 'Documento do Colaborador';
      case 'instituicao':
        return 'Documento Institucional';
      default:
        return 'Documento';
    }
  };

  const renderForm = () => {
    console.log('renderForm chamado - entityType:', entityType);
    if (!entityType) {
      return <Typography>Tipo de entidade inválido</Typography>;
    }
    switch (entityType) {
      case 'aluno':
          console.log('Renderizando AlunoForm');
        return <AlunoForm onChange={handleFormChange} />;
      case 'colaborador':
          console.log('Renderizando ColaboradorForm');
        return <ColaboradorForm onChange={handleFormChange} />;
      case 'instituicao':
          console.log('Renderizando InstituicaoForm');
        return <InstituicaoForm onChange={handleFormChange} />;
      default:
        console.log('Tipo de entidade inválido:', entityType);
        return <Typography>Tipo de entidade inválido</Typography>;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top', 'bottom']}>
      <Container variant="screen" style={{ flex: 1 }}>
        <Typography variant="caption" style={{ marginBottom: 8, opacity: 0.5 }}>
          Debug: entityType = {String(entityType)}
        </Typography>
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            {getTitle()}
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Preencha os dados do documento antes de capturar
          </Typography>
        </View>

        <View style={styles.formContainer}>
          <Typography variant="caption" style={{ marginBottom: 8, opacity: 0.5 }}>
            Debug: renderForm() abaixo
          </Typography>
          {renderForm()}
        </View>

        <View style={styles.footer}>
          <Button
            title="Voltar"
            onPress={() => router.back()}
            variant="outline"
            style={styles.button}
          />
          <Button
            title="Continuar"
            onPress={handleContinue}
            disabled={!isValid}
            style={styles.button}
          />
        </View>
        {/* Espaço extra para não sobrepor barra inferior */}
        <View style={{ height: 24 }} />
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  formContainer: {
    flex: 1,
  },
    // scrollContent removido no debug
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  button: {
    flex: 1,
  },
});
