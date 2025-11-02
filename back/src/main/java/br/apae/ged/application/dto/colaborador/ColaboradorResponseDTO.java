package br.apae.ged.application.dto.colaborador;

import br.apae.ged.domain.models.Colaborador;

import java.time.LocalDate;

public record ColaboradorResponseDTO(
        Long id,
        String nome,
        String cpf,
        String cargo,
        LocalDate dataCriacao
) {
    public static ColaboradorResponseDTO fromEntity(Colaborador colaborador) {
        return new ColaboradorResponseDTO(
                colaborador.getId(),
                colaborador.getNome(),
                colaborador.getCpf().getCpf(),
                colaborador.getCargo(),
                colaborador.getCreatedAt().toLocalDate());
    }
}