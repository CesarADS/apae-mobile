package br.apae.ged.domain.repositories;

import br.apae.ged.domain.models.CodigoAutenticacaoInstitucional;
import br.apae.ged.domain.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodigoAutenticacaoInstitucionalRepository extends JpaRepository<CodigoAutenticacaoInstitucional, Long> {

    Optional<CodigoAutenticacaoInstitucional> findByUsuarioAndInstitucionalIdAndCodigo(
            User usuario, Long institucionalId, String codigo);
}
