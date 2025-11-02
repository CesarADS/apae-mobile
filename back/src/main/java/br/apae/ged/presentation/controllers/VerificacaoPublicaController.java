package br.apae.ged.presentation.controllers;

import br.apae.ged.application.dto.document.VerificarAssinaturaDTO;
import br.apae.ged.application.services.VerificacaoPublicaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/publica")
@Tag(name = "Verificação Pública", description = "Endpoints públicos para verificação de autenticidade de documentos.")
public class VerificacaoPublicaController {

    private final VerificacaoPublicaService verificacaoPublicaService;

    @Operation(summary = "Verifica um arquivo de documento PDF",
            description = "Recebe um arquivo PDF, calcula seu hash e busca por assinaturas correspondentes no sistema para verificar sua autenticidade.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Documento autêntico. Retorna a lista de assinaturas encontradas."),
            @ApiResponse(responseCode = "404", description = "Documento não encontrado ou inválido. Nenhuma assinatura corresponde ao arquivo enviado.", content = @Content)
    })
    @PostMapping(value = "/verificar-documento/{codigoVerificacao}", consumes = "multipart/form-data")
    public ResponseEntity<List<VerificarAssinaturaDTO>> verificarDocumentoPublico(
            @RequestParam("arquivo") MultipartFile arquivo,
            @PathVariable String codigoVerificacao
            )  throws IOException, NoSuchAlgorithmException {

        List<VerificarAssinaturaDTO> resultado = verificacaoPublicaService.verificarDocumentoPublico(arquivo, codigoVerificacao);


        return ResponseEntity.ok(resultado);
    }
}
