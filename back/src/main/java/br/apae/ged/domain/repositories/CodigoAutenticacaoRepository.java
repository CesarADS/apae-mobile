package br.apae.ged.domain.repositories;

import br.apae.ged.domain.models.CodigoAutenticacao;
import br.apae.ged.domain.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodigoAutenticacaoRepository extends JpaRepository<CodigoAutenticacao, Long> {

    // Usado para validar o código na confirmação da assinatura
    Optional<CodigoAutenticacao> findByUsuarioAndDocumentoIdAndCodigo(User usuario, Long documentoId, String codigo);
}
