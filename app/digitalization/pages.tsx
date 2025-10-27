import { Button, Typography } from '@/components';
import { CapturedPage, EntityType } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PagesScreen() {
  const router = useRouter();
  const { entityType, formData, pages: pagesParam } = useLocalSearchParams<{
    entityType: EntityType;
    formData: string;
    pages: string;
  }>();

  const [pages, setPages] = useState<CapturedPage[]>(
    pagesParam ? JSON.parse(pagesParam) : []
  );

  const handleAddPage = () => {
    // Voltar para a câmera para capturar mais uma página
    router.push({
      pathname: './camera' as any,
      params: {
        entityType,
        formData,
        existingPages: JSON.stringify(pages),
      },
    });
  };

  const handleRemovePage = (index: number) => {
    Alert.alert(
      'Remover Página',
      'Deseja remover esta página?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const newPages = pages.filter((_, i) => i !== index);
            setPages(newPages);
            if (newPages.length === 0) {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleContinue = () => {
    if (pages.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma página');
      return;
    }

    // Navegar para a tela de upload
    router.push({
      pathname: './upload' as any,
      params: {
        entityType,
        formData,
        pages: JSON.stringify(pages),
      },
    });
  };

  const renderPage = ({ item, index }: { item: CapturedPage; index: number }) => (
    <View style={styles.pageItem}>
      <View style={styles.pageNumber}>
        <Typography variant="caption" style={styles.pageNumberText}>
          Página {index + 1}
        </Typography>
      </View>
      
      <Image source={{ uri: item.uri }} style={styles.pageImage} resizeMode="cover" />
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemovePage(index)}
      >
        <MaterialIcons name="delete" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h2">Páginas Capturadas</Typography>
          <Typography variant="body" style={styles.subtitle}>
            {pages.length} {pages.length === 1 ? 'página' : 'páginas'}
          </Typography>
        </View>

        <FlatList
          data={pages}
          renderItem={renderPage}
          keyExtractor={(_, index) => `page-${index}`}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Typography variant="body" style={styles.emptyText}>
                Nenhuma página capturada
              </Typography>
            </View>
          }
        />

        <View style={styles.footer}>
          <Button
            title="Adicionar Página"
            onPress={handleAddPage}
            variant="outline"
            style={styles.addButton}
          />
          <Button
            title="Finalizar"
            onPress={handleContinue}
            disabled={pages.length === 0}
            style={styles.finishButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  listContent: {
    gap: 12,
    paddingBottom: 16,
  },
  pageItem: {
    flex: 1,
    aspectRatio: 1 / 1.414, // A4
    margin: 6,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  pageNumber: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  pageNumberText: {
    color: '#FFF',
  },
  pageImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#F44336',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    opacity: 0.5,
  },
  footer: {
    gap: 12,
    marginTop: 16,
  },
  addButton: {
    width: '100%',
  },
  finishButton: {
    width: '100%',
  },
});
