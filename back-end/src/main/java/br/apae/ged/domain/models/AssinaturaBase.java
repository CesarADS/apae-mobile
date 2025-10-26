package br.apae.ged.domain.models;

import br.apae.ged.domain.models.enums.TipoAssinatura;
import java.time.LocalDateTime;

public interface AssinaturaBase {
    User getUsuario();
    LocalDateTime getDataAssinatura();
    String getCodigoVerificacao();
    TipoAssinatura getTipo();
    String getHashDocumento();
    void setHashDocumento(String hash);
}
