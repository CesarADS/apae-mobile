import { Button, Container, Typography } from '@/components';
import { EntityType } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Vamos importar os componentes de formulário específicos
import AlunoForm from './forms/AlunoForm';
import ColaboradorForm from './forms/ColaboradorForm';
import InstituicaoForm from './forms/InstituicaoForm';

export default function DigitalizationFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    entityType: entityTypeParam, 
    prefillData: prefillDataParam 
  } = useLocalSearchParams<{ 
    entityType?: string | string[]; 
    prefillData?: string;
  }>();

  // Normaliza o parâmetro (expo-router pode retornar string ou string[])
  const entityTypeRaw = Array.isArray(entityTypeParam) ? entityTypeParam[0] : entityTypeParam;
  const isEntityType = (v: any): v is EntityType => v === 'aluno' || v === 'colaborador' || v === 'instituicao';
  const entityType = isEntityType(entityTypeRaw) ? entityTypeRaw : undefined;
  
  // Parse dos dados pré-preenchidos se existirem
  const prefillData = prefillDataParam ? JSON.parse(prefillDataParam) : null;
  
  const [formData, setFormData] = useState<any>(null);
  const [isValid, setIsValid] = useState(false);

  const handleFormChange = (data: any, valid: boolean) => {
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
        return <AlunoForm onChange={handleFormChange} prefillData={prefillData} />;
      case 'colaborador':
          console.log('Renderizando ColaboradorForm');
        return <ColaboradorForm onChange={handleFormChange} prefillData={prefillData} />;
      case 'instituicao':
          console.log('Renderizando InstituicaoForm');
        return <InstituicaoForm onChange={handleFormChange} prefillData={prefillData} />;
      default:
        console.log('Tipo de entidade inválido:', entityType);
        return <Typography>Tipo de entidade inválido</Typography>;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <Container variant="screen" style={styles.screenContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentWrapper}>
              {renderForm()}
              
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
            </View>
          </ScrollView>
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  contentWrapper: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
  },
});
