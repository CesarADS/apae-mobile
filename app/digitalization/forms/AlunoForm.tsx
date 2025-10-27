import { Button, Input, Typography } from '@/components';
import { useApiClient } from '@/hooks';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Aluno {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
}

interface TipoDocumento {
  id: number;
  nome: string;
  categoria: string;
}

interface AlunoFormData {
  alunoId: number | null;
  alunoNome: string;
  tipoDocumento: string;
  dataDocumento: Date;
}

interface AlunoFormProps {
  onChange: (data: AlunoFormData, isValid: boolean) => void;
}

const AlunoForm: React.FC<AlunoFormProps> = ({ onChange }) => {
  const { get } = useApiClient();
  
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  
  const [formData, setFormData] = useState<AlunoFormData>({
    alunoId: null,
    alunoNome: '',
    tipoDocumento: '',
    dataDocumento: new Date(),
  });

  // Buscar tipos de documento da categoria ALUNO
  useEffect(() => {
    const fetchTiposDocumento = async () => {
      try {
        const response = await get<TipoDocumento[]>('/tipo-documento/ativos');
        // Filtrar apenas os tipos de documento da categoria ALUNO
        const tiposAluno = (response || []).filter(tipo => tipo.categoria === 'ALUNO');
        setTiposDocumento(tiposAluno);
      } catch (error: any) {
        const errorMessage = error?.message || 'Erro desconhecido';
        // Não mostrar alerta para erro de token (será tratado no contexto)
        if (!errorMessage.includes('Usuário ou senha inválidos')) {
          Alert.alert('Erro', 'Não foi possível carregar os tipos de documento');
        }
        console.error('Erro ao carregar tipos de documento:', error);
      }
    };

    fetchTiposDocumento();
  }, []);

  // Buscar alunos quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.length < 2) {
      setAlunos([]);
      setShowSuggestions(false);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await get<{ content: Aluno[] }>(`/aluno?search=${searchTerm}&page=0&size=10`);
        setAlunos(response.content || []);
        setShowSuggestions(true);
      } catch (error: any) {
        const errorMessage = error?.message || 'Erro desconhecido';
        // Não mostrar alerta para erro de token
        if (!errorMessage.includes('Usuário ou senha inválidos')) {
          Alert.alert('Erro', 'Não foi possível buscar alunos');
        }
        console.error('Erro ao buscar alunos:', error);
        setAlunos([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Validar e notificar mudanças
  useEffect(() => {
    const isValid = 
      formData.alunoId !== null &&
      formData.tipoDocumento !== '' &&
      formData.dataDocumento !== null;

    onChange(formData, isValid);
  }, [formData]);

  const handleAlunoSelect = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setSearchTerm(`${aluno.nome} - Matrícula: ${aluno.matricula}`);
    setShowSuggestions(false);
    setFormData(prev => ({
      ...prev,
      alunoId: aluno.id,
      alunoNome: aluno.nome,
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
      {/* Campo de busca de aluno moderno */}
      <View style={styles.field}>
        <Typography variant="body" style={styles.label}>
          Aluno *
        </Typography>
        <Input
          placeholder="Digite nome, matrícula ou CPF..."
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
            if (selectedAluno) {
              setSelectedAluno(null);
              setFormData(prev => ({ ...prev, alunoId: null, alunoNome: '' }));
            }
          }}
          autoCapitalize="words"
        />
        {loading && <ActivityIndicator style={styles.loader} />}
        
        {/* Lista de sugestões */}
        {showSuggestions && alunos.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={alunos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleAlunoSelect(item)}
                >
                  <Typography variant="body" style={styles.suggestionName}>
                    {item.nome}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Matrícula: {item.matricula}
                  </Typography>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              scrollEnabled={false}
              nestedScrollEnabled
            />
          </View>
        )}
        
        {/* Aluno selecionado */}
        {selectedAluno && (
          <View style={styles.selectedAlunoContainer}>
            <Typography variant="body" color="primary" style={styles.selectedAlunoText}>
              ✓ {selectedAluno.nome} - Matrícula: {selectedAluno.matricula}
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
  selectedAlunoContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedAlunoText: {
    fontWeight: '600',
  },
});

export default AlunoForm;
