package br.apae.ged.application.services;

import br.apae.ged.application.dto.document.DocumentUploadResponseDTO;
import br.apae.ged.application.dto.document.GerarDocumentoPessoaDTO;
import br.apae.ged.application.dto.documentoIstitucional.InstitucionalDTO;
import br.apae.ged.application.dto.documentoIstitucional.InstucionalResponse;
import br.apae.ged.application.dto.documentoIstitucional.UploadInstitucionalRequest;
import br.apae.ged.application.dto.documentoIstitucional.AtualizarInstitucionalRequest;
import br.apae.ged.application.dto.documentoIstitucional.GerarDocInstitucionalRequest;
import br.apae.ged.application.dto.documentoIstitucional.InstucionalUploadResponse;
import br.apae.ged.application.exceptions.NotFoundException;
import br.apae.ged.application.exceptions.ValidationException;
import br.apae.ged.domain.models.Institucional;
import br.apae.ged.domain.models.TipoDocumento;
import br.apae.ged.domain.repositories.InstitucionalRepository;
import br.apae.ged.domain.repositories.TipoDocumentoRepository;
import br.apae.ged.domain.utils.AuthenticationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;


@Service
@RequiredArgsConstructor
public class InstitucionalService {

    private final InstitucionalRepository institucionalRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final GeracaoPdfService pdfGenerationService;

    /**
     * Retorna todos os documentos institucionais enviados pelo usuário logado
     */
    public List<InstitucionalDTO> listarMeusDocumentosInstitucionais() {
        var usuario = AuthenticationUtil.retriveAuthenticatedUser();
        var docs = institucionalRepository.findByUploadedBy_Id(usuario.getId());
        return docs.stream().map(doc -> new InstitucionalDTO(
            doc.getId(),
            doc.getTitulo(),
            doc.getTipoDocumento() != null ? doc.getTipoDocumento().getNome() : null,
            doc.getDataDocumento(),
            doc.isAtivo(),
            doc.getDataUpload(),
            doc.getUploadedBy() != null ? doc.getUploadedBy().getNome() : null
        )).toList();
    }

    public byte[] gerarPdf(GerarDocInstitucionalRequest entrada) throws Exception {
        try {
            GerarDocumentoPessoaDTO dto = new GerarDocumentoPessoaDTO(
                entrada.texto(),
                null,
                entrada.tipoDocumento(),
                entrada.titulo(),
                entrada.rodape()
            );
            
            return pdfGenerationService.generatePdf(dto);
        } catch (Exception e) {
            throw new Exception("Não foi possível criar o PDF: " + e.getMessage(), e);
        }
    }

    public InstucionalUploadResponse uploadDocumento (UploadInstitucionalRequest entrada) throws IOException {
        MultipartFile documento = entrada.documento();
        if (documento == null || documento.isEmpty()){
            throw new ValidationException("O arquivo está vazio");
        }
        if (entrada.dataCriacao() == null) {
            throw new ValidationException("Data do documento é obrigatória");
        }

        var usuario = AuthenticationUtil.retriveAuthenticatedUser();

        String tipoDocumentoNome = entrada.tipoDocumento().trim();
        TipoDocumento tipoDoc = tipoDocumentoRepository.findByNomeIgnoreCase(tipoDocumentoNome)
                .orElseThrow(() -> new NotFoundException("Tipo de documento '" + tipoDocumentoNome + "' não encontrado"));

        String base64 = Base64.getEncoder().encodeToString(documento.getBytes());
        String tConteudo = documento.getContentType();

        institucionalRepository.save( new Institucional(entrada, base64, tConteudo, tipoDoc, usuario));
        return new InstucionalUploadResponse(entrada.nome());
    }

    public DocumentUploadResponseDTO gerarESalvarPdf(GerarDocInstitucionalRequest dto) throws Exception {
        byte[] pdfBytes = gerarPdf(dto);
        String base64 = Base64.getEncoder().encodeToString(pdfBytes);

        var usuario = AuthenticationUtil.retriveAuthenticatedUser();

        TipoDocumento tipoDoc = tipoDocumentoRepository.findByNomeIgnoreCase(dto.tipoDocumento().trim())
                .orElseThrow(() -> new NotFoundException("Tipo de documento '" + dto.tipoDocumento() + "' não encontrado"));

        Institucional institucional = new Institucional();
        institucional.setTitulo(dto.titulo() != null ? dto.titulo() : "Documento Sem Título");
        institucional.setConteudo(base64);
        institucional.setTipoConteudo("application/pdf");
        institucional.setDataDocumento(LocalDate.now());
        institucional.setDataUpload(LocalDateTime.now());
        institucional.setAtivo(true);
        institucional.setUploadedBy(usuario);
        institucional.setTipoDocumento(tipoDoc);
        
        Institucional docSalvo = institucionalRepository.save(institucional);

        return new DocumentUploadResponseDTO(docSalvo.getId(), "Documento institucional gerado e salvo com sucesso!");
    }

    public Page<InstucionalResponse> listarDocumentos(String tipoDocumento, String titulo, LocalDate dataCriacao, Pageable pageable) {
        Specification<Institucional> spec = (root, query, cb) -> cb.isTrue(root.get("isAtivo"));
        if (tipoDocumento != null && !tipoDocumento.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("tipoDocumento").get("nome")), "%" + tipoDocumento.toLowerCase() + "%")
            );
        }
        if (titulo != null && !titulo.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("titulo")), "%" + titulo.toLowerCase() + "%")
            );
        }
        if (dataCriacao != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("dataDocumento"), dataCriacao)
            );
        }

        Pageable pageableComOrdenacao = pageable;
        if (pageable.getSort().isUnsorted()) {
            pageableComOrdenacao = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by("dataUpload").descending()
            );
        }

        Page<Institucional> documentPage = institucionalRepository.findAll(spec, pageableComOrdenacao);
        return documentPage.map(InstucionalResponse::new);
    }

    public InstucionalResponse visualizarUm(Long id) {
        var institucional = institucionalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Não foi possível encontrar o documento institucional"));

        return new InstucionalResponse(institucional);
    }


    public InstucionalResponse atualizar (Long id, AtualizarInstitucionalRequest dto) throws IOException {
        var institucional = institucionalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Não foi possível encontrar o documento institucional"));
        if (dto.tipoDocumento() != null && !dto.tipoDocumento().isBlank()) {
            TipoDocumento tipoDoc = tipoDocumentoRepository.findByNomeIgnoreCase(dto.tipoDocumento().trim())
                    .orElseThrow(() -> new NotFoundException("Tipo de documento não encontrado"));
            institucional.setTipoDocumento(tipoDoc);
        }
        if (dto.titulo() != null && !dto.titulo().isEmpty()) {
            institucional.setTitulo(dto.titulo());
        }
        if (dto.dataCriacao() != null) {
            institucional.setDataDocumento(dto.dataCriacao());
        }

        if (dto.file() != null) {
            MultipartFile documento = dto.file();
            String base64 = Base64.getEncoder().encodeToString(documento.getBytes());
            String tConteudo = documento.getContentType();
            institucional.setConteudo(base64);
            institucional.setTipoConteudo(tConteudo);
            institucional.setDataDocumento(dto.dataCriacao());
            institucional.setTitulo(dto.titulo());
            institucional.setTipoDocumento(tipoDocumentoRepository.findByNomeIgnoreCase(dto.tipoDocumento().trim())
                    .orElseThrow(() -> new NotFoundException("Tipo de documento não encontrado")));
        }

        institucional.setUpdatedBy(AuthenticationUtil.retriveAuthenticatedUser());
        institucional.setDataUpdate(LocalDateTime.now());
        Institucional docAtualizado = institucionalRepository.save(institucional);
        return new InstucionalResponse(docAtualizado);
    }

    public void inativar (Long id) {
        var institucional = institucionalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Não foi possível encontrar o documento institucional"));
        institucional.setAtivo(false);
        institucional.setUpdatedBy(AuthenticationUtil.retriveAuthenticatedUser());
        institucional.setDataUpdate(LocalDateTime.now());
        institucionalRepository.save(institucional);
    }
}
