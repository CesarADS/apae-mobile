package br.apae.ged.application.dto.documentoIstitucional;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record InstitucionalDTO(
    Long id,
    String titulo,
    String tipoDocumento,
    LocalDate dataDocumento,
    boolean isAtivo,
    LocalDateTime dataUpload,
    String nomeUsuario
) {}
