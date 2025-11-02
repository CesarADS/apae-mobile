package br.apae.ged.domain.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity @Getter @Setter @Table(name = "tb_estado")
@SQLDelete(sql = "UPDATE tb_estado SET deleted_at = now() WHERE id=?")
@SQLRestriction("deleted_at is null")
public class Estado {

    @Id
    private Long id;
    private String nome;
    private String uf;
    private LocalDateTime deletedAt;

}
