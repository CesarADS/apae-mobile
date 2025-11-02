
package br.apae.ged.domain.repositories.specifications;

import br.apae.ged.domain.models.Document;
import br.apae.ged.domain.models.Pessoa;
import br.apae.ged.domain.models.TipoDocumento;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class DocumentSpecification {

    public static Specification<Document> isLast() {
        return (root, query, cb) -> cb.isTrue(root.get("isLast"));
    }

    public static Specification<Document> byPessoaNome(String nome) {
        if (nome == null || nome.isBlank())
            return null;
        return (root, query, cb) -> {
            Join<Document, Pessoa> pessoaJoin = root.join("pessoa");
            return cb.like(cb.lower(pessoaJoin.get("nome")), "%" + nome.toLowerCase() + "%");
        };
    }

    public static Specification<Document> byPessoaCpf(String cpf) {
        if (cpf == null || cpf.isBlank())
            return null;

        String cpfNumeros = cpf.replaceAll("[^0-9]", "");

        if (cpfNumeros.isEmpty()) {
            return null;
        }

        return (root, query, cb) -> {
            Join<Document, Pessoa> pessoaJoin = root.join("pessoa");

            Expression<String> cpfSemPontuacao = cb.function("REPLACE", String.class,
                    cb.function("REPLACE", String.class, pessoaJoin.get("cpf").get("cpf"), cb.literal("."),
                            cb.literal("")),
                    cb.literal("-"), cb.literal(""));
            return cb.like(cpfSemPontuacao, "%" + cpfNumeros + "%");
        };
    }

    public static Specification<Document> isAtivo() {
        return (root, query, cb) -> cb.isTrue(root.get("isAtivo"));
    }

    public static Specification<Document> isPermanente() {
        return (root, query, cb) -> {
            Join<Document, TipoDocumento> tipoDocumentoJoin = root.join("tipoDocumento");
            return cb.isTrue(tipoDocumentoJoin.get("guardaPermanente"));
        };
    }

    public static Specification<Document> validoAte(LocalDate data) {
        if (data == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("validade"), data);
    }

    public static Specification<Document> expirado(LocalDate data) {
        if (data == null) {
            return null;
        }
        return (root, query, cb) -> cb.lessThan(root.get("validade"), data);
    }
}
