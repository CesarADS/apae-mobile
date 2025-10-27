package br.apae.ged.application.dto.documentoIstitucional;

import br.apae.ged.domain.models.Institucional;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record InstucionalResponse(
        Long id,
        String titulo,
        String tipoConteudo,
        String doc,
        LocalDate dataCriacao,
        LocalDateTime dataUpload,
        LocalDateTime dataDownload,
        String tipoDocumento,
        LocalDate validade
) {
    public InstucionalResponse(Institucional doc) {
        this(
                doc.getId(),
                doc.getTitulo(),
                doc.getTipoConteudo(),
                doc.getInstitucionalContent() != null ? doc.getInstitucionalContent().getConteudo() : null,
                doc.getDataDocumento(),
                doc.getDataUpload(),
                doc.getDataDownload(),
                doc.getTipoDocumento() != null ? doc.getTipoDocumento().getNome() : null,
                doc.getValidade()
        );
    }


}
