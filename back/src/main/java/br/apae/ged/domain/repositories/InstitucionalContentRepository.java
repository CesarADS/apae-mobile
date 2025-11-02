package br.apae.ged.domain.repositories;

import br.apae.ged.domain.models.InstitucionalContent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitucionalContentRepository extends JpaRepository<InstitucionalContent, Long> {
}
