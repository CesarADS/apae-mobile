package br.apae.ged.domain.repositories.specifications;

import br.apae.ged.domain.models.TipoDocumento;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class TipoDocumentoSpecification {

    public static Specification<TipoDocumento> isAtivo() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("isAtivo"));
    }

    public static Specification<TipoDocumento> byNome(String nome) {
        if (nome == null || nome.isBlank()) {
            return null;
        }
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(criteriaBuilder.lower(root.get("nome")), "%" + nome.toLowerCase() + "%");
    }

    public static Specification<TipoDocumento> isGuardaPermanente() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("guardaPermanente"));
    }

    public static Specification<TipoDocumento> isNotInstitucional() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isFalse(root.get("institucional"));
    }

    public static Specification<TipoDocumento> isInstitucional() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("institucional"));
    }

    public static Specification<TipoDocumento> isColaborador() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("colaborador"));
    }

    public static Specification<TipoDocumento> isNotColaborador() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isFalse(root.get("colaborador"));
    }

    public static Specification<TipoDocumento> isGeravel() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("podeGerarDocumento"));
    }

    public static Specification<TipoDocumento> isNotGeravel() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isFalse(root.get("podeGerarDocumento"));
    }
}
