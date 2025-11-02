package br.apae.ged.domain.repositories;

import br.apae.ged.domain.models.Document;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long>, JpaSpecificationExecutor<Document> {
	// Busca todos os documentos enviados por um usuário específico com paginação
	Page<Document> findByUploadedBy_Id(Long userId, Pageable pageable);
}
