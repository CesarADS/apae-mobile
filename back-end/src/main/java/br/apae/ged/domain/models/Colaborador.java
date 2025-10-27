package br.apae.ged.domain.models;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tb_colaborador")
@SQLDelete(sql = "UPDATE tb_colaborador SET deleted_at = now() WHERE id=?")
@SQLRestriction("deleted_at is null")
@PrimaryKeyJoinColumn(name = "id")
public class Colaborador extends Pessoa {

    private String cargo;
    private LocalDateTime deletedAt;
}