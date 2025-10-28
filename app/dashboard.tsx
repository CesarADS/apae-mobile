import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Container, Typography } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useDocuments } from '../hooks';
import { Document } from '../types';

export default function DashboardScreen() {
  const { logout } = useAuth();
  const { loading, loadingMore, hasMore, error, fetchAllDocuments, clearError } = useDocuments();
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const documents = await fetchAllDocuments(0);
    setAllDocuments(documents);
    setCurrentPage(0);
  };

  const loadMoreDocuments = async () => {
    if (!hasMore || loadingMore) return;
    
    const nextPage = currentPage + 1;
    const moreDocuments = await fetchAllDocuments(nextPage);
    setAllDocuments(prev => [...prev, ...moreDocuments]);
    setCurrentPage(nextPage);
  };

  const handleDigitalizeDocument = () => {
    router.push('./digitalization/select-entity' as any);
  };

  const handleRefresh = () => {
    if (error) clearError();
    loadDocuments();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair do aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const renderDocumentItem = ({ item }: { item: Document }) => (
    <View style={styles.documentItem}>
      <View style={styles.documentContent}>
        <View style={styles.documentHeader}>
          <Typography variant="body" style={styles.documentTitle} numberOfLines={2}>
            {item.titulo}
          </Typography>
          <View style={[
            styles.typeTag,
            { backgroundColor: item.type === 'institucional' ? '#E3F2FD' : '#F3E5F5' }
          ]}>
            <Typography 
              variant="caption" 
              style={[
                styles.typeText,
                { color: item.type === 'institucional' ? '#1976D2' : '#7B1FA2' }
              ]}
            >
              {item.type === 'institucional' ? 'Institucional' : 'Pessoa'}
            </Typography>
          </View>
        </View>
        <Typography variant="body" color="secondary">
          {item.tipoDocumento}
        </Typography>
        <Typography variant="caption" color="secondary" style={styles.dateText}>
          Enviado em {formatDate(item.dataUpload)}
        </Typography>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com botão de logout */}
      <View style={styles.header}>
        <Typography variant="h3" color="primary">
          Digitalizador - GED APAE
        </Typography>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Typography variant="body" color="error">
            Sair
          </Typography>
        </TouchableOpacity>
      </View>

      <Container style={styles.content}>
        {/* Botão Digitalizar Documento - Metade superior */}
        <View style={styles.digitalizationSection}>
          <TouchableOpacity
            style={styles.digitalizeButton}
            onPress={handleDigitalizeDocument}
            activeOpacity={0.8}
          >
            <View style={styles.digitalizeContent}>
              <Typography variant="h2" style={[{ color: 'white' }]} align="center">
                📱
              </Typography>
              <Typography variant="h3" style={[{ color: 'white' }]} align="center">
                Digitalizar documento
              </Typography>
              <Typography variant="body" style={[{ color: 'white' }]} align="center">
                Toque aqui para escanear um novo documento
              </Typography>
            </View>
          </TouchableOpacity>
        </View>

        {/* Lista de documentos recentes - Metade inferior */}
        <View style={styles.documentsSection}>
          <Typography variant="h3" color="primary" style={styles.sectionTitle}>
            Digitalizados recentemente
          </Typography>
          
          {error && (
            <View style={styles.errorContainer}>
              <Typography variant="body" color="error" align="center">
                {error}
              </Typography>
              <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                <Typography variant="body" color="primary">
                  Tentar novamente
                </Typography>
              </TouchableOpacity>
            </View>
          )}
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Typography variant="body" color="secondary">
                Carregando documentos...
              </Typography>
            </View>
          ) : allDocuments.length > 0 ? (
            <FlatList
              data={allDocuments}
              renderItem={renderDocumentItem}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              style={styles.documentsList}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMoreDocuments}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.loadingMoreContainer}>
                    <Typography variant="body" color="secondary">
                      Carregando mais...
                    </Typography>
                  </View>
                ) : null
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Typography variant="body" color="secondary" align="center">
                Nenhum documento encontrado
              </Typography>
              <Typography variant="caption" color="secondary" align="center" style={styles.emptySubtext}>
                Comece digitalizando seu primeiro documento!
              </Typography>
            </View>
          )}
        </View>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 0,
  },
  digitalizationSection: {
    flex: 0.4, // 40% da tela
    padding: 24,
    justifyContent: 'center',
  },
  digitalizeButton: {
    backgroundColor: '#007BFF',
    borderRadius: 16,
    padding: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minHeight: 200,
    justifyContent: 'center',
  },
  digitalizeContent: {
    alignItems: 'center',
  },
  digitalizeTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  documentsSection: {
    flex: 0.6, // 60% da tela
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  documentsList: {
    flex: 1,
  },
  documentItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  documentContent: {
    flex: 1,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  documentTitle: {
    flex: 1,
    marginRight: 12,
    fontWeight: '600',
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptySubtext: {
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: '#FFE6E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  retryButton: {
    marginTop: 12,
    padding: 8,
    alignSelf: 'center',
  },
  loadingMoreContainer: {
    padding: 16,
    alignItems: 'center',
  },
});