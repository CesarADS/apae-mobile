package br.apae.ged.presentation.controllers;

import br.apae.ged.application.dto.autenticacao.CodigoAutenticacaoDTO;
import br.apae.ged.application.dto.document.*;
import br.apae.ged.application.dto.user.UserLoginDTO;
import br.apae.ged.application.dto.document.DocumentDTO;
import br.apae.ged.application.dto.document.DocumentRequestDTO;
import br.apae.ged.application.dto.document.DocumentResponseDTO;
import br.apae.ged.application.dto.document.GerarDocumentoPessoaDTO;
import br.apae.ged.application.dto.document.DocumentUploadResponseDTO;
import br.apae.ged.application.services.DocumentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/documentos")
@Tag(name = "Documentos", description = "Endpoints para upload, download e gerenciamento de documentos de pessoas (Alunos/Colaboradores).")
public class DocumentController {

    private final DocumentService service;

        @Operation(summary = "Lista documentos enviados pelo usuário logado", description = "Retorna todos os documentos cujo uploaded_by é o usuário autenticado com paginação.")
        @GetMapping("/meus")
        @PreAuthorize("hasAuthority('DOCUMENTO_ALUNO_READ')")
        public ResponseEntity<Page<DocumentDTO>> listarMeusDocumentos(
                @Parameter(description = "Objeto de paginação (page, size, sort)") Pageable pageable) {
                var documentos = service.listarMeusDocumentos(pageable);
                return ResponseEntity.ok(documentos);
        }

    @Operation(summary = "Upload de um novo documento para uma pessoa", description = "Realiza o upload de um arquivo e o associa a uma pessoa (aluno ou colaborador) específica.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Upload realizado com sucesso."),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou pessoa não encontrada.", content = @Content)
    })
    @PostMapping(value = "/create/{pessoaId}", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('DOCUMENTO_ALUNO_WRITE', 'DOCUMENTO_COLABORADOR_WRITE')")
    public ResponseEntity<DocumentUploadResponseDTO> uploadPessoa(
            @ModelAttribute DocumentRequestDTO document,
            @Parameter(description = "ID da Pessoa (Aluno ou Colaborador) à qual o documento será associado.") @PathVariable("pessoaId") Long id)
            throws IOException {
        return ResponseEntity.status(201).body(service.upload(document, id));
    }

    @Operation(summary = "Lista documentos de uma pessoa", description = "Retorna uma lista paginada com a última versão dos documentos para uma pessoa específica, permitindo filtro por título.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Documentos listados com sucesso.")
    })
    @GetMapping("/listar/pessoa/{pessoaId}")
    @PreAuthorize("hasAnyAuthority('DOCUMENTO_ALUNO_READ', 'DOCUMENTO_COLABORADOR_READ')")
    public ResponseEntity<?> visualizarTodos(
            @Parameter(description = "ID da Pessoa (Aluno ou Colaborador) para listar os documentos.") @PathVariable Long pessoaId,
            @RequestParam(required = false) String termoBusca,
            Pageable pageable) {
        var paginaDeDocumentos = service.listarPorPessoa(pessoaId, termoBusca, pageable);
        return ResponseEntity.ok(paginaDeDocumentos);
    }

    @Operation(summary = "Visualiza um documento específico", description = "Retorna os detalhes de um único documento, incluindo seu conteúdo em base64.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Documento retornado com sucesso."),
            @ApiResponse(responseCode = "404", description = "Documento não encontrado.", content = @Content)
    })
    @GetMapping(value = "/listarUm/{id}")
    @PreAuthorize("hasAnyAuthority('DOCUMENTO_ALUNO_READ', 'DOCUMENTO_COLABORADOR_READ')")
    public ResponseEntity<?> listarUm(
            @Parameter(description = "ID do documento a ser visualizado.") @PathVariable Long id) throws Exception {
        var documento = service.visualizarUm(id);
        return ResponseEntity.ok(documento);
    }

    @Operation(summary = "Atualiza um documento", description = "Atualiza o tipo de documento ou o arquivo de um documento existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Documento atualizado com sucesso."),
            @ApiResponse(responseCode = "404", description = "Documento não encontrado.", content = @Content)
    })
    @PutMapping(value = "/update/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('DOCUMENTO_ALUNO_WRITE', 'DOCUMENTO_COLABORADOR_WRITE')")
    public ResponseEntity<DocumentResponseDTO> update(
            @Parameter(description = "ID do documento a ser atualizado.") @PathVariable Long id,
            @ModelAttribute DocumentRequestDTO dto) throws IOException {
        DocumentResponseDTO updatedDocument = service.update(id, dto);
        return ResponseEntity.ok(updatedDocument);
    }

    @Operation(summary = "Ativa ou inativa um documento", description = "Altera o status de um documento (ativo/inativo).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Status alterado com sucesso."),
            @ApiResponse(responseCode = "404", description = "Documento não encontrado.", content = @Content)
    })
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('DOCUMENTO_ALUNO_DELETE', 'DOCUMENTO_COLABORADOR_DELETE')")
    public ResponseEntity<Void> changeStatus(
            @Parameter(description = "ID do documento para alterar o status.") @PathVariable Long id) {
        service.changeStatus(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Gera um documento PDF para uma pessoa", description = "Cria um documento PDF, salva no banco de dados associado a uma pessoa e retorna o arquivo para download.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "PDF gerado com sucesso."),
            @ApiResponse(responseCode = "500", description = "Erro ao gerar o PDF.", content = @Content)
    })
    @PostMapping("/visualizar")
    @PreAuthorize("hasAnyAuthority('DOCUMENTO_ALUNO_WRITE', 'DOCUMENTO_COLABORADOR_WRITE')")
    public ResponseEntity<byte[]> gerarPdf(@RequestBody GerarDocumentoPessoaDTO dto) {
        try {
            byte[] pdfBytes = service.gerarPdf(dto);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=documento.pdf")
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Gera e salva um novo documento PDF para uma pessoa", description = "Cria um documento PDF a partir de textos e o salva, associando-o a uma pessoa.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "PDF gerado e salvo com sucesso."),
            @ApiResponse(responseCode = "400", description = "Dados inválidos.", content = @Content)
    })
    @PostMapping("/gerar")
    @PreAuthorize("hasAnyAuthority('DOCUMENTO_ALUNO_WRITE', 'DOCUMENTO_COLABORADOR_WRITE')")
    public ResponseEntity<DocumentUploadResponseDTO> gerarESalvarPdf(@RequestBody GerarDocumentoPessoaDTO dto)
            throws IOException {
        DocumentUploadResponseDTO response = service.gerarESalvarPdf(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Lista todos os documentos permanentes", description = "Lista todos os documentos permanentes paginados e com filtragem")
    @GetMapping("/listar_permanente")
    @PreAuthorize("hasAnyAuthority('DOCUMENTO_ALUNO_READ', 'DOCUMENTO_COLABORADOR_READ')")
    public ResponseEntity<?> listarPermanentes(Pageable pageable, @RequestParam(required = false) String termoBusca, Long id) {
        var paginaDeDocumentos = service.listarPermanente(id, termoBusca, pageable);
        return ResponseEntity.ok(paginaDeDocumentos);
    }

    @Operation(summary = "Baixa o arquivo original de um documento", description = "Fornece o arquivo original de um documento para download, garantindo sua integridade.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Download iniciado com sucesso."),
            @ApiResponse(responseCode = "404", description = "Documento não encontrado.", content = @Content)
    })
    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyAuthority('DOCUMENTO_ALUNO_READ', 'DOCUMENTO_COLABORADOR_READ')")
    public ResponseEntity<byte[]> downloadDocumento(
            @Parameter(description = "ID do documento a ser baixado.") @PathVariable Long id) {
        DownloadDTO downloadDTO = service.download(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(downloadDTO.tipoConteudo()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadDTO.nomeArquivo() + "\"")
                .body(downloadDTO.conteudo());
    }

    @Operation(summary = "Registra uma assinatura simples em um documento",
            description = "Registra uma assinatura eletrônica simples (sem valor jurídico de integridade) em um documento, usando apenas e-mail e senha.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Assinatura simples registrada com sucesso."),
            @ApiResponse(responseCode = "400", description = "Senha inválida ou documento já assinado pelo usuário.", content = @Content),
            @ApiResponse(responseCode = "404", description = "Documento ou usuário não encontrado.", content = @Content)
    })
    @PostMapping("/assinar-simples/{id}")
    @PreAuthorize("hasAnyAuthority('DOCUMENTO_ALUNO_WRITE', 'DOCUMENTO_COLABORADOR_WRITE')")
    public ResponseEntity<Void> assinarSimples(
            @Parameter(description = "ID do documento a ser assinado.") @PathVariable Long id,
            @RequestBody UserLoginDTO entrada) {
        service.assinarSimples(id, entrada);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "1. Inicia o processo de assinatura avançada",
            description = "Primeiro passo para a assinatura avançada. Valida a senha do usuário e envia um código de 6 dígitos para o seu e-mail.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Código de autenticação enviado para o e-mail do usuário."),
            @ApiResponse(responseCode = "400", description = "Senha inválida ou documento já assinado pelo usuário.", content = @Content),
            @ApiResponse(responseCode = "404", description = "Documento ou usuário não encontrado.", content = @Content)
    })
    @PostMapping("/iniciar-assinatura/{id}")
    @PreAuthorize("hasAnyAuthority('DOCUMENTO_ALUNO_WRITE', 'DOCUMENTO_COLABORADOR_WRITE')")
    public ResponseEntity<Void> iniciarAssinatura(
            @Parameter(description = "ID do documento a ser assinado.") @PathVariable Long id,
            @RequestBody UserLoginDTO senha) {
        service.iniciarAssinatura(id, senha);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "2. Confirma a assinatura avançada com código 2FA",
            description = "Segundo e último passo para a assinatura avançada. Valida o código de 6 dígitos recebido por e-mail e, se correto, finaliza a assinatura.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Assinatura registrada com sucesso."),
            @ApiResponse(responseCode = "400", description = "Código de autenticação inválido, expirado ou já utilizado.", content = @Content),
            @ApiResponse(responseCode = "404", description = "Documento ou usuário não encontrado.", content = @Content)
    })
    @PostMapping("/confirmar-assinatura/{id}")
    @PreAuthorize("hasAnyAuthority('DOCUMENTO_ALUNO_WRITE', 'DOCUMENTO_COLABORADOR_WRITE')")
    public ResponseEntity<Void> confirmarAssinatura(
            @Parameter(description = "ID do documento a ser assinado.") @PathVariable Long id,
            @RequestBody CodigoAutenticacaoDTO entrada,
            HttpServletRequest request) {
        service.confirmarAssinatura(id, entrada, request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Verifica a integridade das assinaturas de um documento",
            description = "Retorna uma lista de todas as assinaturas de um documento e o status de validade de cada uma, comparando o hash atual do documento com o hash armazenado no momento da assinatura.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verificação realizada com sucesso."),
            @ApiResponse(responseCode = "404", description = "Documento não encontrado.", content = @Content)
    })
    @GetMapping("/{id}/verificar-assinaturas")
    public ResponseEntity<List<VerificarAssinaturaDTO>> verificarAssinaturas(
            @Parameter(description = "ID do documento a ser verificado.") @PathVariable Long id) {
        List<VerificarAssinaturaDTO> resultado = service.verificarAssinaturas(id);
        return ResponseEntity.ok(resultado);
    }
}
