package br.apae.ged.domain.repositories;

import br.apae.ged.domain.models.Assinatura;
import br.apae.ged.domain.models.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssinaturaRepository extends JpaRepository<Assinatura, Long> {

    List<Assinatura> findByHashDocumento(String hashDocumento);
    List<Assinatura> findByDocumento(Document document);
    Optional<Assinatura> findByCodigoVerificacao(String codigo);
}
