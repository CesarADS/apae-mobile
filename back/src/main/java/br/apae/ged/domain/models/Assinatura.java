package br.apae.ged.domain.models;

import br.apae.ged.domain.models.enums.TipoAssinatura;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
@Entity
@Table(name = "assinaturas")
@Getter
@Setter
public class Assinatura extends EntityID implements AssinaturaBase {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "documento_id", nullable = false)
    private Document documento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dataAssinatura;

    @Column(nullable = false, unique = true)
    private String codigoVerificacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoAssinatura tipo;

    @Column(name = "hash_documento", length = 64)
    private String hashDocumento;

    @Column(name = "ip_signatario")
    private String ipSignatario;

    @PrePersist
    public void prePersist() {
        if (this.codigoVerificacao == null) {
            this.codigoVerificacao = UUID.randomUUID().toString();
        }
        if (this.dataAssinatura == null) {
            this.dataAssinatura = LocalDateTime.now();
        }
    }
}
