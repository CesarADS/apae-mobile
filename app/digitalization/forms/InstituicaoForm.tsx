import { Button, Input, Typography } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { useApiClient } from '@/hooks';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

interface TipoDocumento {
  id: number;
  nome: string;
  institucional: boolean;
  colaborador: boolean;
  guardaPermanente: boolean;
  isAtivo: boolean;
}

interface InstituicaoFormData {
  titulo: string;
  tipoDocumento: string;
  dataDocumento: Date;
  localizacao: string;
}

interface InstituicaoFormProps {
  onChange: (data: InstituicaoFormData, isValid: boolean) => void;
  prefillData?: InstituicaoFormData | null;
}

const InstituicaoForm: React.FC<InstituicaoFormProps> = ({ onChange, prefillData }) => {
  const { data } = useAuth();
  
  // Criar apiClient com token inicial
  const api = useApiClient({ initialToken: data?.token || null });
  
  // Atualizar token quando mudar
  useEffect(() => {
    if (data?.token) {
      api.setToken(data.token);
    }
  }, [data?.token]);
  
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<InstituicaoFormData>({
    titulo: prefillData?.titulo || '',
    tipoDocumento: '',
    dataDocumento: new Date(),
    localizacao: prefillData?.localizacao || '',
  });

  // Buscar tipos de documento de INSTITUIÇÃO
  useEffect(() => {
    const fetchTiposDocumento = async () => {
      try {
        const response = await api.get<TipoDocumento[]>('/tipo-documento/ativos');
        // Filtrar apenas os tipos de documento de INSTITUIÇÃO (institucional=true)
        const tiposInstitucional = (response || []).filter((tipo: TipoDocumento) => tipo.institucional === true);
        setTiposDocumento(tiposInstitucional);
      } catch (error: any) {
        const errorMessage = error?.message || 'Erro desconhecido';
        // Não mostrar alerta para erro de token
        if (!errorMessage.includes('Usuário ou senha inválidos')) {
          Alert.alert('Erro', 'Não foi possível carregar os tipos de documento');
        }
      } finally {
        setLoading(false);
      }
    };

    if (data?.token) {
      fetchTiposDocumento();
    } else {
      setLoading(false);
    }
  }, [data?.token]);

  // Validar e notificar mudanças
  useEffect(() => {
    const isValid = 
      formData.titulo.trim() !== '' &&
      formData.tipoDocumento !== '' &&
      formData.dataDocumento !== null;

    onChange(formData, isValid);
  }, [formData]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        dataDocumento: selectedDate,
      }));
    }
  };

  return (
    <View style={styles.container}>
      {/* Header com ícone */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="business" size={56} color="#007BFF" />
        </View>
        <Typography variant="h2" color="primary" style={styles.headerTitle}>
          Documento institucional
        </Typography>
        <Typography variant="body" color="secondary" align="center" style={styles.headerSubtitle}>
          Preencha as informações abaixo para digitalizar o documento
        </Typography>
      </View>

      {/* Card com formulário */}
      <View style={styles.formCard}>
        {/* Localização - PRIMEIRO CAMPO */}
        <View style={styles.field}>
          <Typography variant="body" style={styles.label}>
            Localização
          </Typography>
          <Input
            placeholder="Digite a localização do documento..."
            value={formData.localizacao}
            onChangeText={(localizacao) => setFormData(prev => ({ ...prev, localizacao }))}
            autoCapitalize="words"
          />
        </View>

        {/* Campo de título */}
        <View style={styles.field}>
          <Typography variant="body" style={styles.label}>
            Título do Documento *
          </Typography>
          <Input
            placeholder="Digite o título..."
            value={formData.titulo}
            onChangeText={(titulo) => setFormData(prev => ({ ...prev, titulo }))}
            autoCapitalize="words"
          />
        </View>

      {/* Picker de tipo de documento */}
        <View style={styles.field}>
          <Typography variant="body" style={styles.label}>
            Tipo de documento *
          </Typography>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.tipoDocumento}
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, tipoDocumento: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Selecione o tipo..." value="" />
              {tiposDocumento.map(tipo => (
                <Picker.Item key={tipo.id} label={tipo.nome} value={tipo.nome} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Data do documento */}
        <View style={styles.field}>
          <Typography variant="body" style={styles.label}>
            Data do documento *
          </Typography>
          <Button
            title={formData.dataDocumento.toLocaleDateString('pt-BR')}
            onPress={() => setShowDatePicker(true)}
            variant="outline"
          />
          {showDatePicker && (
            <DateTimePicker
              value={formData.dataDocumento}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    marginBottom: 8,
  },
  headerSubtitle: {
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 8,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    marginVertical: -4,
  },
  picker: {
    height: 56,
  },
});

export default InstituicaoForm;
