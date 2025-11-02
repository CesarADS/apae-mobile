package br.apae.ged.domain.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity @Setter @Getter @Table(name = "tb_cidade")
@SQLDelete(sql = "UPDATE tb_cidade SET deleted_at = now() WHERE id=?")
@SQLRestriction("deleted_at is null")
public class Cidade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String nome;
    @ManyToOne
    @JoinColumn(name = "estado_id")
    private Estado estado;
    @Column(unique = true)
    private String ibge;
    private LocalDateTime deletedAt;

    public Cidade(Cidade cidade) {
    }

    public Cidade(){}
}
