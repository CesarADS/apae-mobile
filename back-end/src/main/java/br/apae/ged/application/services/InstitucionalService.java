package br.apae.ged.application.services;

import br.apae.ged.application.dto.document.DocumentUploadResponseDTO;
import br.apae.ged.application.dto.document.DownloadDTO;
import br.apae.ged.application.dto.document.GerarDocumentoPessoaDTO;
import br.apae.ged.application.dto.documentoIstitucional.*;
import br.apae.ged.application.exceptions.NotFoundException;
import br.apae.ged.application.exceptions.ValidationException;
import br.apae.ged.domain.models.*;
import br.apae.ged.domain.repositories.*;
import br.apae.ged.domain.repositories.specifications.InstituicionalSpecification;
import br.apae.ged.domain.utils.AuthenticationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Random;


@Service
@RequiredArgsConstructor
public class InstitucionalService {

    private final InstitucionalRepository institucionalRepository;
    private final InstitucionalContentRepository institucionalContentRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final PdfService pdfService;
    private final EmailService emailService;
    private final LogService logService;

    public Page<InstitucionalDTO> listarMeusDocumentosInstitucionais(Pageable pageable) {
        var usuario = AuthenticationUtil.retriveAuthenticatedUser();
        var docsPage = institucionalRepository.findByUploadedBy_Id(usuario.getId(), pageable);
        return docsPage.map(doc -> new InstitucionalDTO(
            doc.getId(),
            doc.getTitulo(),
            doc.getTipoDocumento() != null ? doc.getTipoDocumento().getNome() : null,
            doc.getDataDocumento(),
            doc.isAtivo(),
            doc.getDataUpload(),
            doc.getUploadedBy() != null ? doc.getUploadedBy().getNome() : null
        ));
    }

    public byte[] gerarPdf(GerarDocInstitucionalRequest entrada) throws Exception {
        try {
            GerarDocumentoPessoaDTO dto = new GerarDocumentoPessoaDTO(
                entrada.texto(),
                null,
                entrada.tipoDocumento(),
                entrada.titulo()
            );

            User user = AuthenticationUtil.retriveAuthenticatedUser();
            logService.registrarAcao(
                    "INFO",
                    user.getNome(),
                    user.getEmail(),
                    "GENERATE_PDF",
                    "Documento Institucional PDF gerado com o titulo: " + entrada.titulo()
            );

            return pdfService.gerarPdf(dto);
        } catch (Exception e) {
            throw new Exception("Não foi possível criar o PDF: " + e.getMessage(), e);
        }
    }

    @Transactional
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

        Institucional savedDoc = institucionalRepository.save( new Institucional(entrada, base64, tConteudo, tipoDoc, usuario));

        logService.registrarAcao(
                "INFO",
                usuario.getNome(),
                usuario.getEmail(),
                "UPLOAD",
                "Documento institucional " + savedDoc.getTitulo() + " carregado com sucesso."
        );

        return new InstucionalUploadResponse(entrada.nome());
    }

    @Transactional
    public DocumentUploadResponseDTO gerarESalvarPdf(GerarDocInstitucionalRequest dto) throws Exception {
        byte[] pdfBytes = gerarPdf(dto);
        String base64 = Base64.getEncoder().encodeToString(pdfBytes);

        var usuario = AuthenticationUtil.retriveAuthenticatedUser();

        TipoDocumento tipoDoc = tipoDocumentoRepository.findByNomeIgnoreCase(dto.tipoDocumento().trim())
                .orElseThrow(() -> new NotFoundException("Tipo de documento '" + dto.tipoDocumento() + "' não encontrado"));

        Institucional institucional = new Institucional();
        institucional.setTitulo(dto.titulo() != null ? dto.titulo() : "Documento Sem Título");
        institucional.setTipoConteudo("application/pdf");
        institucional.setDataDocumento(LocalDate.now());
        institucional.setDataUpload(LocalDateTime.now());
        institucional.setAtivo(true);
        institucional.setUploadedBy(usuario);
        institucional.setTipoDocumento(tipoDoc);
        institucional.setValidade(LocalDate.now().plusDays(tipoDoc.getValidade()));

        setInstitucionalContent(institucional, base64);
        
        Institucional docSalvo = institucionalRepository.save(institucional);

        logService.registrarAcao(
                "INFO",
                usuario.getNome(),
                usuario.getEmail(),
                "GENERATE_AND_SAVE_PDF",
                "Documento institucional " + docSalvo.getTitulo() + " gerado e salvo com sucesso."
        );

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

    @Transactional(readOnly = true)
    public InstucionalResponse visualizarUm(Long id) {
        var institucional = institucionalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Não foi possível encontrar o documento institucional"));

        return new InstucionalResponse(institucional);
    }

    @Transactional
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
            setInstitucionalContent(institucional, base64);
            institucional.setTipoConteudo(tConteudo);
            institucional.setDataDocumento(dto.dataCriacao());
            institucional.setTitulo(dto.titulo());
            institucional.setTipoDocumento(tipoDocumentoRepository.findByNomeIgnoreCase(dto.tipoDocumento().trim())
                    .orElseThrow(() -> new NotFoundException("Tipo de documento não encontrado")));
        }

        User user = AuthenticationUtil.retriveAuthenticatedUser();
        institucional.setUpdatedBy(user);
        institucional.setDataUpdate(LocalDateTime.now());
        Institucional docAtualizado = institucionalRepository.save(institucional);

        logService.registrarAcao(
                "INFO",
                user.getNome(),
                user.getEmail(),
                "UPDATE",
                "Documento institucional " + docAtualizado.getTitulo() + " atualizado com sucesso."
        );

        return new InstucionalResponse(docAtualizado);
    }

    public void inativar (Long id) {
        var institucional = institucionalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Não foi possível encontrar o documento institucional"));
        institucional.setAtivo(false);
        User user = AuthenticationUtil.retriveAuthenticatedUser();
        institucional.setUpdatedBy(user);
        institucional.setDataUpdate(LocalDateTime.now());
        institucionalRepository.save(institucional);

        logService.registrarAcao(
                "INFO",
                user.getNome(),
                user.getEmail(),
                "INACTIVATE",
                "Documento institucional " + institucional.getTitulo() + " inativado com sucesso."
        );
    }

    public Page<InstucionalResponse> listarPermanente (String termoBusca, Pageable pageable) {
        Specification<Institucional> specFinal = Specification.where(InstituicionalSpecification.isAtivo()
                .and(InstituicionalSpecification.isPermanente()));

        if (termoBusca != null){
            specFinal = specFinal.and(InstituicionalSpecification.byTitulo(termoBusca));
        }

        return institucionalRepository.findAll(specFinal, pageable)
                .map(InstucionalResponse::new);
    }

    @Transactional(readOnly = true)
    public DownloadDTO download(Long id) {
        Institucional documento = institucionalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Documento não encontrado"));

        byte[] conteudo = getInstitucionalBytes(documento);
        String nomeArquivo = documento.getTitulo() + ".pdf";

        return new DownloadDTO(nomeArquivo, conteudo, documento.getTipoConteudo());
    }

    private byte[] getInstitucionalBytes(Institucional document) {
        InstitucionalContent content = document.getInstitucionalContent();
        if (content == null || content.getConteudo() == null) {
            return new byte[0];
        }
        return Base64.getDecoder().decode(content.getConteudo());
    }

    private void setInstitucionalContent(Institucional document, String base64Content) {
        InstitucionalContent content = document.getInstitucionalContent();
        if (content == null) {
            content = new InstitucionalContent();
            content.setInstitucional(document);
            document.setInstitucionalContent(content);
        }
        content.setConteudo(base64Content);
    }
}
