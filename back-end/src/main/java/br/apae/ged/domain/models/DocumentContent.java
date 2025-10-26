package br.apae.ged.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity(name = "tb_documentos_conteudo")
public class DocumentContent {

    @Id
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String conteudo;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private Document document;
}
