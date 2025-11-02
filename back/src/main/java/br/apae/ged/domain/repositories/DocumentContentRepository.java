package br.apae.ged.domain.repositories;

import br.apae.ged.domain.models.DocumentContent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentContentRepository extends JpaRepository<DocumentContent, Long> {
}
