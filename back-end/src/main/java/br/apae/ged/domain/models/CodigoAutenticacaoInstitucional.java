package br.apae.ged.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "codigos_autenticacao_institucional")
public class CodigoAutenticacaoInstitucional extends EntityID {

    @Column(nullable = false)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institucional_id", nullable = false)
    private Institucional institucional;

    @Column(nullable = false)
    private LocalDateTime dataExpiracao;
}
