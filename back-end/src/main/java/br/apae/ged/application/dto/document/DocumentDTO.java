package br.apae.ged.application.dto.document;

import java.time.LocalDateTime;

public record DocumentDTO(
    Long id,
    String titulo,
    String tipoDocumento,
    LocalDateTime dataUpload,
    boolean isLast,
    String nomeUsuario
) {}
