import { Button, Input, Typography } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { useApiClient } from '@/hooks';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

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
      console.log('[InstituicaoForm] Definindo token no apiClient');
      api.setToken(data.token);
    }
  }, [data?.token]);
  
  console.log('InstituicaoForm renderizando...');
  
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<InstituicaoFormData>({
    titulo: prefillData?.titulo || '',
    tipoDocumento: '',
    dataDocumento: new Date(),
  });

  // Buscar tipos de documento de INSTITUIÇÃO
  useEffect(() => {
    const fetchTiposDocumento = async () => {
      try {
        console.log('[InstituicaoForm] Buscando tipos de documento, token presente:', !!data?.token);
        const response = await api.get<TipoDocumento[]>('/tipo-documento/ativos');
        console.log('[InstituicaoForm] Tipos de documento recebidos:', response);
        // Filtrar apenas os tipos de documento de INSTITUIÇÃO (institucional=true)
        const tiposInstitucional = (response || []).filter((tipo: TipoDocumento) => tipo.institucional === true);
        console.log('[InstituicaoForm] Tipos de documento INSTITUCIONAL encontrados:', tiposInstitucional.length);
        setTiposDocumento(tiposInstitucional);
      } catch (error: any) {
        const errorMessage = error?.message || 'Erro desconhecido';
        console.error('[InstituicaoForm] Erro ao buscar tipos:', errorMessage);
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
      console.log('[InstituicaoForm] Token não disponível ainda');
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
        <Typography variant="h3" style={{ marginBottom: 16 }}>
          Formulário Institucional
        </Typography>
      
        <View style={{ padding: 20, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 16 }}>
          <Typography variant="body" style={{ marginBottom: 8 }}>
            ✅ O formulário está renderizando!
          </Typography>
          <Typography variant="caption">
            Tipos disponíveis: {tiposDocumento.length}
          </Typography>
        </View>
      
        {loading && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Typography>Carregando...</Typography>
          </View>
        )}
      
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
          Tipo de Documento *
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
          Data do Documento *
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
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
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
  },
  picker: {
    height: 48,
  },
});

export default InstituicaoForm;
