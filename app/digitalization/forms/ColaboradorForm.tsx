import { Button, Input, Typography } from '@/components';
import { useApiClient } from '@/hooks';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Colaborador {
  id: number;
  nome: string;
  cpf: string;
}

interface TipoDocumento {
  id: number;
  nome: string;
  categoria: string;
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
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  
  const [formData, setFormData] = useState<ColaboradorFormData>({
    colaboradorId: null,
    colaboradorNome: '',
    tipoDocumento: '',
    dataDocumento: new Date(),
  });

  // Buscar tipos de documento da categoria COLABORADOR
  useEffect(() => {
    const fetchTiposDocumento = async () => {
      try {
        const response = await get<TipoDocumento[]>('/tipo-documento/ativos');
        // Filtrar apenas os tipos de documento da categoria COLABORADOR
        const tiposColaborador = (response || []).filter(tipo => tipo.categoria === 'COLABORADOR');
        setTiposDocumento(tiposColaborador);
      } catch (error: any) {
        const errorMessage = error?.message || 'Erro desconhecido';
        // Não mostrar alerta para erro de token
        if (!errorMessage.includes('Usuário ou senha inválidos')) {
          Alert.alert('Erro', 'Não foi possível carregar os tipos de documento');
        }
        console.error('Erro ao carregar tipos de documento:', error);
      }
    };

    fetchTiposDocumento();
  }, []);

  // Buscar colaboradores quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.length < 2) {
      setColaboradores([]);
      setShowSuggestions(false);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await get<{ content: Colaborador[] }>(`/colaborador?search=${searchTerm}&page=0&size=10`);
        setColaboradores(response.content || []);
        setShowSuggestions(true);
      } catch (error: any) {
        const errorMessage = error?.message || 'Erro desconhecido';
        // Não mostrar alerta para erro de token
        if (!errorMessage.includes('Usuário ou senha inválidos')) {
          Alert.alert('Erro', 'Não foi possível buscar colaboradores');
        }
        console.error('Erro ao buscar colaboradores:', error);
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

  const handleColaboradorSelect = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setSearchTerm(`${colaborador.nome} - CPF: ${colaborador.cpf}`);
    setShowSuggestions(false);
    setFormData(prev => ({
      ...prev,
      colaboradorId: colaborador.id,
      colaboradorNome: colaborador.nome,
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
      {/* Campo de busca de colaborador moderno */}
      <View style={styles.field}>
        <Typography variant="body" style={styles.label}>
          Colaborador *
        </Typography>
        <Input
          placeholder="Digite nome ou CPF..."
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
            if (selectedColaborador) {
              setSelectedColaborador(null);
              setFormData(prev => ({ ...prev, colaboradorId: null, colaboradorNome: '' }));
            }
          }}
          autoCapitalize="words"
        />
        {loading && <ActivityIndicator style={styles.loader} />}
        
        {/* Lista de sugestões */}
        {showSuggestions && colaboradores.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={colaboradores}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleColaboradorSelect(item)}
                >
                  <Typography variant="body" style={styles.suggestionName}>
                    {item.nome}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    CPF: {item.cpf}
                  </Typography>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              scrollEnabled={false}
              nestedScrollEnabled
            />
          </View>
        )}
        
        {/* Colaborador selecionado */}
        {selectedColaborador && (
          <View style={styles.selectedColaboradorContainer}>
            <Typography variant="body" color="primary" style={styles.selectedColaboradorText}>
              ✓ {selectedColaborador.nome} - CPF: {selectedColaborador.cpf}
            </Typography>
          </View>
        )}
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
            locale="pt-BR"
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
    overflow: 'hidden',
    marginVertical: -4,
  },
  picker: {
    height: 56,
  },
  loader: {
    marginTop: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 12,
  },
  suggestionName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  selectedColaboradorContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedColaboradorText: {
    fontWeight: '600',
  },
});

export default ColaboradorForm;
