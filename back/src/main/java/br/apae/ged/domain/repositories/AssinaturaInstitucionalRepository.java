package br.apae.ged.domain.repositories;

import br.apae.ged.domain.models.AssinaturaInstitucional;
import br.apae.ged.domain.models.Institucional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssinaturaInstitucionalRepository extends JpaRepository<AssinaturaInstitucional, Long> {

    Optional<AssinaturaInstitucional> findByCodigoVerificacao(String codigoVerificacao);

    List<AssinaturaInstitucional> findByInstitucional(Institucional institucional);
}
