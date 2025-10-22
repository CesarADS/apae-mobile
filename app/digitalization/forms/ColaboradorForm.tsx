import { Button, Input, Typography } from '@/components';
import { useApiClient } from '@/hooks';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

interface Colaborador {
  id: number;
  nome: string;
  cpf: string;
}

interface TipoDocumento {
  id: number;
  nome: string;
}

interface ColaboradorFormData {
  colaboradorId: number | null;
  colaboradorNome: string;
  tipoDocumento: string;
  dataDocumento: Date;
}

interface ColaboradorFormProps {
  onChange: (data: ColaboradorFormData, isValid: boolean) => void;
}

const ColaboradorForm: React.FC<ColaboradorFormProps> = ({ onChange }) => {
  const { get } = useApiClient();
  
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState<ColaboradorFormData>({
    colaboradorId: null,
    colaboradorNome: '',
    tipoDocumento: '',
    dataDocumento: new Date(),
  });

  // Buscar tipos de documento
  useEffect(() => {
    const fetchTiposDocumento = async () => {
      try {
        const response = await get<TipoDocumento[]>('/tipo-documento/ativos');
        setTiposDocumento(response || []);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os tipos de documento');
        console.error(error);
      }
    };

    fetchTiposDocumento();
  }, []);

  // Buscar colaboradores quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.length < 2) {
      setColaboradores([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await get<{ content: Colaborador[] }>(`/colaborador?search=${searchTerm}&page=0`);
        setColaboradores(response.content || []);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível buscar colaboradores');
        console.error(error);
        setColaboradores([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Validar e notificar mudanças
  useEffect(() => {
    const isValid = 
      formData.colaboradorId !== null &&
      formData.tipoDocumento !== '' &&
      formData.dataDocumento !== null;

    onChange(formData, isValid);
  }, [formData]);

  const handleColaboradorSelect = (colaboradorId: number) => {
    const colaborador = colaboradores.find(c => c.id === colaboradorId);
    setFormData(prev => ({
      ...prev,
      colaboradorId: colaboradorId,
      colaboradorNome: colaborador?.nome || '',
    }));
  };

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
      {/* Campo de busca de colaborador */}
      <View style={styles.field}>
        <Typography variant="body" style={styles.label}>
          Colaborador *
        </Typography>
        <Input
          placeholder="Digite nome ou CPF..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="words"
        />
        {loading && <ActivityIndicator style={styles.loader} />}
      </View>

      {/* Picker de colaborador */}
      {colaboradores.length > 0 && (
        <View style={styles.field}>
          <Typography variant="body" style={styles.label}>
            Selecione o colaborador
          </Typography>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.colaboradorId ?? undefined}
              onValueChange={handleColaboradorSelect}
              style={styles.picker}
            >
              <Picker.Item label="Selecione..." value={undefined} />
              {colaboradores.map(colaborador => (
                <Picker.Item
                  key={colaborador.id}
                  label={`${colaborador.nome} - ${colaborador.cpf}`}
                  value={colaborador.id}
                />
              ))}
            </Picker>
          </View>
        </View>
      )}

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
  loader: {
    marginTop: 8,
  },
});

export default ColaboradorForm;
