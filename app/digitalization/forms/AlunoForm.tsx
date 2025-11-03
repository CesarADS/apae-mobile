import { Button, Input, Typography } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { useApiClient } from '@/hooks';
import { MaterialIcons } from '@expo/vector-icons';
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
  institucional: boolean;
  colaborador: boolean;
  guardaPermanente: boolean;
  isAtivo: boolean;
}

interface AlunoFormData {
  alunoId: number | null;
  alunoNome: string;
  tipoDocumento: string;
  dataDocumento: Date;
  localizacao: string;
}

interface AlunoFormProps {
  onChange: (data: AlunoFormData, isValid: boolean) => void;
  prefillData?: AlunoFormData | null;
}

const AlunoForm: React.FC<AlunoFormProps> = ({ onChange, prefillData }) => {
  const { data } = useAuth();
  const api = useApiClient({ initialToken: data?.token || null });
  
  // Atualizar token quando mudar
  useEffect(() => {
    if (data?.token) {
      api.setToken(data.token);
    }
  }, [data?.token]);
  
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(prefillData?.alunoNome || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  
  const [formData, setFormData] = useState<AlunoFormData>({
    alunoId: prefillData?.alunoId || null,
    alunoNome: prefillData?.alunoNome || '',
    tipoDocumento: '', // Sempre limpar tipo de documento (usuário deve escolher novo)
    dataDocumento: new Date(), // Sempre data atual para novo documento
    localizacao: prefillData?.localizacao || '',
  });

  // Preencher aluno selecionado se veio dos dados pré-preenchidos
  useEffect(() => {
    const fetchAlunoCompleto = async () => {
      if (prefillData?.alunoId && data?.token) {
        try {
          // Buscar dados completos do aluno pelo ID
          const aluno = await api.get<Aluno>(`/alunos/${prefillData.alunoId}`);
          setSelectedAluno(aluno);
          setSearchTerm(`${aluno.nome} - Matrícula: ${aluno.matricula}`);
        } catch (error) {
          // Se não conseguir buscar, usar dados parciais
          setSelectedAluno({
            id: prefillData.alunoId,
            nome: prefillData.alunoNome,
            cpf: '',
            matricula: '',
          });
          setSearchTerm(prefillData.alunoNome);
        }
      }
    };

    fetchAlunoCompleto();
  }, [prefillData, data?.token]);

  // Buscar tipos de documento da categoria ALUNO
  useEffect(() => {
    const fetchTiposDocumento = async () => {
      try {
        const response = await api.get<TipoDocumento[]>('/tipo-documento/ativos');
        
        // Filtrar apenas os tipos de documento de ALUNO
        const tiposAluno = (response || []).filter(tipo => !tipo.institucional && !tipo.colaborador);
        setTiposDocumento(tiposAluno);
      } catch (error: any) {
        const errorMessage = error?.message || 'Erro desconhecido';
        if (!errorMessage.includes('Usuário ou senha inválidos')) {
          Alert.alert('Erro', 'Não foi possível carregar os tipos de documento');
        }
      }
    };

    if (data?.token) {
      fetchTiposDocumento();
    }
  }, [data?.token]);

  // Buscar alunos quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.length < 2) {
      setAlunos([]);
      setShowSuggestions(false);
      setLoading(false);
      return;
    }

    if (!data?.token) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get<{ content: Aluno[] }>(`/alunos/all?termoBusca=${searchTerm}&page=0&size=10`);
        setAlunos(response.content || []);
        setShowSuggestions(true);
      } catch (error: any) {
        const errorMessage = error?.message || 'Erro desconhecido';
        if (!errorMessage.includes('Usuário ou senha inválidos')) {
          Alert.alert('Erro', 'Não foi possível buscar alunos');
        }
        setAlunos([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, data?.token]);

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
      {/* Header com ícone */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="school" size={56} color="#007BFF" />
        </View>
        <Typography variant="h2" color="primary" style={styles.headerTitle}>
          Documento do aluno
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

        {/* Campo de busca de aluno */}
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
              locale="pt-BR"
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Removido flex: 1 para evitar sobreposição
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
    paddingBottom: 16,
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
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  field: {
    marginBottom: 20,
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
