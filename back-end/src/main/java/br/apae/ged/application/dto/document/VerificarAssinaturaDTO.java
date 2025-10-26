package br.apae.ged.application.dto.document;

import br.apae.ged.domain.models.Assinatura;
import br.apae.ged.domain.models.enums.TipoAssinatura;

import java.time.LocalDateTime;

public record VerificarAssinaturaDTO(
        String nomeSignatario,
        LocalDateTime dataAssinatura,
        TipoAssinatura tipo,
        boolean valida,
        String mensagem
) {
    public VerificarAssinaturaDTO VerificarAssinaturaDTO (Assinatura assinatura, boolean valida, String mensagem) {
        return new VerificarAssinaturaDTO(
               assinatura.getUsuario().getNome(),
                assinatura.getDataAssinatura(),
                assinatura.getTipo(),
                valida,
                mensagem
        );
    }
}
