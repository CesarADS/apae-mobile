import { Button, Typography } from '@/components';
import { Colors } from '@/constants/colors';
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
      'Remover página',
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
        {/* Header compacto e horizontal */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconContainer}>
              <MaterialIcons name="photo-library" size={24} color={Colors.primary} />
            </View>
            <View>
              <Typography variant="h3" color="primary">
                Páginas capturadas
              </Typography>
              <View style={styles.counterContainer}>
                <MaterialIcons name="description" size={16} color={Colors.primary} />
                <Typography variant="body" color="primary" style={styles.counter}>
                  {pages.length} {pages.length === 1 ? 'página' : 'páginas'}
                </Typography>
              </View>
            </View>
          </View>
        </View>

        <FlatList
          data={pages}
          renderItem={renderPage}
          keyExtractor={(_, index) => `page-${index}`}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="photo-library" size={64} color={Colors.textLight} />
              <Typography variant="body" color="secondary" style={styles.emptyText}>
                Nenhuma página capturada
              </Typography>
              <Typography variant="caption" color="secondary" style={styles.emptySubtext}>
                Toque em "Adicionar página" para começar
              </Typography>
            </View>
          }
        />

        <View style={styles.footer}>
          <Button
            title="Adicionar página"
            onPress={handleAddPage}
            variant="outline"
            style={styles.addButton}
          />
          <Button
            title="Finalizar e continuar"
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
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  counter: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  pageItem: {
    flex: 1,
    aspectRatio: 1 / 1.414, // A4
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundDark,
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary + '20',
  },
  pageNumber: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pageNumberText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  pageImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.error,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptySubtext: {
    marginTop: 4,
    opacity: 0.7,
  },
  footer: {
    gap: 12,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addButton: {
    width: '100%',
  },
  finishButton: {
    width: '100%',
  },
});
