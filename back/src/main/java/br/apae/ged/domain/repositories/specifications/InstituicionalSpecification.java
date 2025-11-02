package br.apae.ged.domain.repositories.specifications;

import br.apae.ged.domain.models.Institucional;
import br.apae.ged.domain.models.TipoDocumento;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class InstituicionalSpecification
{
    public static Specification<Institucional> byTipoDocumentoNome(String tipoDocumentoNome) {
        if (tipoDocumentoNome == null || tipoDocumentoNome.isBlank()) {
            return null;
        }
        return (root, query, cb) -> cb.like(cb.lower(root.get("tipoDocumento").get("nome")), "%" + tipoDocumentoNome.toLowerCase() + "%");
    }

    public static Specification<Institucional> byTitulo(String titulo) {
        if (titulo == null || titulo.isBlank()) {
            return null;
        }
        return (root, query, cb) -> cb.like(cb.lower(root.get("titulo")), "%" + titulo.toLowerCase() + "%");
    }

    public static Specification<Institucional> byDataDocumento(LocalDate dataDocumento) {
        if (dataDocumento == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("dataDocumento"), dataDocumento);
    }

    public static Specification<Institucional> isAtivo() {
        return (root, query, cb) -> cb.isTrue(root.get("isAtivo"));
    }

    public static Specification<Institucional> isPermanente() {
        return (root, query, cb) -> {
            Join<Institucional, TipoDocumento> tipoDocumentoJoin = root.join("tipoDocumento");
            return cb.isTrue(tipoDocumentoJoin.get("guardaPermanente"));
        };
    }

    public static Specification<Institucional> validoAte(LocalDate data) {
        if (data == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("validade"), data);
    }

    public static Specification<Institucional> expirado(LocalDate data) {
        if (data == null) {
            return null;
        }
        return (root, query, cb) -> cb.lessThan(root.get("validade"), data);
    }
}