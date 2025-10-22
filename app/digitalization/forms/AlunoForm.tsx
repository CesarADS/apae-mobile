import { Button, Input, Typography } from '@/components';
import { useApiClient } from '@/hooks';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

interface Aluno {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
}

interface TipoDocumento {
  id: number;
  nome: string;
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
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState<AlunoFormData>({
    alunoId: null,
    alunoNome: '',
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

  // Buscar alunos quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.length < 2) {
      setAlunos([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await get<{ content: Aluno[] }>(`/aluno?search=${searchTerm}&page=0`);
        setAlunos(response.content || []);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível buscar alunos');
        console.error(error);
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

  const handleAlunoSelect = (alunoId: number) => {
    const aluno = alunos.find(a => a.id === alunoId);
    setFormData(prev => ({
      ...prev,
      alunoId: alunoId,
      alunoNome: aluno?.nome || '',
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
      {/* Campo de busca de aluno */}
      <View style={styles.field}>
        <Typography variant="body" style={styles.label}>
          Aluno *
        </Typography>
        <Input
          placeholder="Digite nome, matrícula ou CPF..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="words"
        />
        {loading && <ActivityIndicator style={styles.loader} />}
      </View>

      {/* Picker de aluno */}
      {alunos.length > 0 && (
        <View style={styles.field}>
          <Typography variant="body" style={styles.label}>
            Selecione o aluno
          </Typography>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.alunoId ?? undefined}
              onValueChange={handleAlunoSelect}
              style={styles.picker}
            >
              <Picker.Item label="Selecione..." value={undefined} />
              {alunos.map(aluno => (
                <Picker.Item
                  key={aluno.id}
                  label={`${aluno.nome} - ${aluno.matricula}`}
                  value={aluno.id}
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

export default AlunoForm;
