package br.apae.ged.application.dto.document;

import br.apae.ged.domain.models.Alunos;
import br.apae.ged.domain.models.Colaborador;
import br.apae.ged.domain.models.Document;
import br.apae.ged.domain.models.Pessoa;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record DocumentResponseDTO(
        Long id,
        String titulo,
        String tipoConteudo,
        String documento,
        LocalDateTime dataUpload,
        LocalDateTime dataDownload,
        LocalDate dataDocumento,
        PessoaResponseDTO pessoa,
        TipoDocumentoResponseDTO tipoDocumento,
        LocalDate validade,
        String localizacao
        ) {

    public record PessoaResponseDTO(
            Long id,
            String nome,
            String tipo) {
        public static PessoaResponseDTO fromEntity(Pessoa pessoa) {
            if (pessoa == null)
                return null;

            String tipo = "Pessoa";
            if (pessoa instanceof Alunos) {
                tipo = "Aluno";
            } else if (pessoa instanceof Colaborador) {
                tipo = "Colaborador";
            }
            return new PessoaResponseDTO(pessoa.getId(), pessoa.getNome(), tipo);
        }
    }

    public record TipoDocumentoResponseDTO(
            Long id,
            String nome) {
        public static TipoDocumentoResponseDTO fromEntity(br.apae.ged.domain.models.TipoDocumento tipo) {
            if (tipo == null)
                return null;
            return new TipoDocumentoResponseDTO(tipo.getId(), tipo.getNome());
        }
    }

    public static DocumentResponseDTO fromEntity(Document document) {
        String content = document.getDocumentContent() != null ? document.getDocumentContent().getConteudo() : null;
        return new DocumentResponseDTO(
                document.getId(),
                document.getTitulo(),
                document.getTipoConteudo(),
                content,
                document.getDataUpload(),
                document.getDataDownload(),
                document.getDataDocumento(),
                PessoaResponseDTO.fromEntity(document.getPessoa()),
                TipoDocumentoResponseDTO.fromEntity(document.getTipoDocumento()),
                document.getValidade(),
                document.getLocalizacao()
                );
    }

    public static DocumentResponseDTO fromEntityWithoutContent(Document document) {
        return new DocumentResponseDTO(
                document.getId(),
                document.getTitulo(),
                document.getTipoConteudo(),
                null,
                document.getDataUpload(),
                document.getDataDownload(),
                document.getDataDocumento(),
                PessoaResponseDTO.fromEntity(document.getPessoa()),
                TipoDocumentoResponseDTO.fromEntity(document.getTipoDocumento()),
                document.getValidade(),
                document.getLocalizacao()
        );
    }

    public static DocumentResponseDTO fromEntityWithCustomContent(Document document, String customContent) {
        return new DocumentResponseDTO(
                document.getId(),
                document.getTitulo(),
                document.getTipoConteudo(),
                customContent,
                document.getDataUpload(),
                document.getDataDownload(),
                document.getDataDocumento(),
                PessoaResponseDTO.fromEntity(document.getPessoa()),
                TipoDocumentoResponseDTO.fromEntity(document.getTipoDocumento()),
                document.getValidade(),
                document.getLocalizacao()
        );
    }
}