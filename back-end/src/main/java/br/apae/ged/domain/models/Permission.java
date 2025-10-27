package br.apae.ged.domain.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.security.core.GrantedAuthority;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "tb_permissions")
@SQLDelete(sql = "UPDATE tb_permissions SET deleted_at = now() WHERE id=?")
@SQLRestriction("deleted_at is null")
public class Permission implements GrantedAuthority {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String nome;
    private String descricao;
    private LocalDateTime deletedAt;

    @Override
    public String getAuthority() {
        return nome;
    }
}
