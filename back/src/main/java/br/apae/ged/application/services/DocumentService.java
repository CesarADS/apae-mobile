package br.apae.ged.application.services;

import br.apae.ged.application.dto.autenticacao.CodigoAutenticacaoDTO;
import br.apae.ged.application.dto.document.*;
import br.apae.ged.application.dto.user.UserLoginDTO;
import br.apae.ged.application.exceptions.NotFoundException;
import br.apae.ged.application.exceptions.ValidationException;
import br.apae.ged.domain.models.*;
import br.apae.ged.domain.models.enums.TipoAssinatura;
import br.apae.ged.domain.repositories.*;
import br.apae.ged.domain.repositories.specifications.DocumentSpecification;
import br.apae.ged.domain.utils.AuthenticationUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.bouncycastle.util.Bytes;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentContentRepository documentContentRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final LogService logService;
    private final PessoaRepository pessoaRepository;
    private final PdfService pdfService;
    private final PasswordEncoder passwordEncoder;
    private final CodigoAutenticacaoRepository codigoAutenticacaoRepository;
    private final EmailService emailService;
    private final AssinaturaRepository assinaturaRepository;

    @Transactional(readOnly = true)
    public Page<DocumentDTO> listarMeusDocumentos(Pageable pageable) {
        var usuario = AuthenticationUtil.retriveAuthenticatedUser();
        var docsPage = documentRepository.findByUploadedBy_Id(usuario.getId(), pageable);
        return docsPage.map(doc -> new DocumentDTO(
                doc.getId(),
                doc.getTitulo(),
                doc.getTipoDocumento() != null ? doc.getTipoDocumento().getNome() : null,
                doc.getDataUpload(),
                doc.isLast(),
                doc.getUploadedBy() != null ? doc.getUploadedBy().getNome() : null
        ));
    }


    public byte[] gerarPdf(GerarDocumentoPessoaDTO dto) throws IOException {
        User user = AuthenticationUtil.retriveAuthenticatedUser();
        byte[] pdf = pdfService.gerarPdf(dto);
        logService.registrarAcao(
                "INFO",
                user.getNome(),
                user.getEmail(),
                "GENERATE_PDF",
                "Documento PDF gerado para a pessoa com ID: " + dto.pessoaId()
        );
        return pdf;
    }

    @Transactional
    public DocumentUploadResponseDTO upload(DocumentRequestDTO dto, Long pessoaID) throws IOException {
        MultipartFile arquivo = dto.file();
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ValidationException("O arquivo está vazio");
        }
        if (dto.dataDocumento() == null) {
            throw new ValidationException("A data do documento é obrigatória.");
        }

        Pessoa pessoa = pessoaRepository.findById(pessoaID)
                .orElseThrow(() -> new NotFoundException("Pessoa com ID " + pessoaID + " não encontrada."));

        var user = AuthenticationUtil.retriveAuthenticatedUser();
        TipoDocumento tipoDoc = tipoDocumentoRepository.findByNome(dto.tipoDocumento())
                .orElseThrow(() -> new NotFoundException(
                        "Tipo de Documento com o nome '" + dto.tipoDocumento() + "' não encontrado."));

        String dataFormatada = dto.dataDocumento().format(
                DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        String novoTitulo = String.format("%s - %s - %s",
                pessoa.getNome(),
                tipoDoc.getNome(),
                dataFormatada);
        String conteudoEmBase64 = Base64.getEncoder().encodeToString(arquivo.getBytes());
        String tipoDoConteudo = arquivo.getContentType();

        Document novoDocumento = Document.builder()
                .titulo(novoTitulo)
                .tipoDocumento(tipoDoc)
                .pessoa(pessoa)
                .uploadedBy(user)
                .dataUpload(LocalDateTime.now())
                .tipoConteudo(tipoDoConteudo)
                .isAtivo(true)
                .isLast(true)
                .dataDocumento(dto.dataDocumento())
                .validade(dto.dataDocumento().plusDays(tipoDoc.getValidade()))
                .localizacao(dto.localizacao())
                .build();

        DocumentContent documentContent = new DocumentContent();
        documentContent.setConteudo(conteudoEmBase64);
        documentContent.setDocument(novoDocumento);
        novoDocumento.setDocumentContent(documentContent);

        var documentoSalvo = documentRepository.save(novoDocumento);

        logService.registrarAcao(
                "INFO",
                user.getNome(),
                user.getEmail(),
                "UPLOAD",
                "Documento " + documentoSalvo.getTitulo() + " para " + pessoa.getNome() + " carregado com sucesso."
        );

        return new DocumentUploadResponseDTO(
                documentoSalvo.getId(),
                "Upload de documento efetuado com sucesso!");
    }

    public DocumentUploadResponseDTO gerarESalvarPdf(GerarDocumentoPessoaDTO dto) throws IOException {
        byte[] pdfBytes = gerarPdf(dto);
        Document documentoSalvo = salvarDocumentoGerado(dto, pdfBytes);

        User user = AuthenticationUtil.retriveAuthenticatedUser();
        logService.registrarAcao(
                "INFO",
                user.getNome(),
                user.getEmail(),
                "GENERATE_AND_SAVE_PDF",
                "Documento PDF gerado e salvo para a pessoa com ID: " + dto.pessoaId()
        );

        return new DocumentUploadResponseDTO(documentoSalvo.getId(), "Documento gerado e salvo com sucesso!");
    }

    private Document salvarDocumentoGerado(GerarDocumentoPessoaDTO dto, byte[] pdfBytes) {
        if (dto.pessoaId() == null) {
            throw new ValidationException("O ID da pessoa é obrigatório.");
        }

        Pessoa pessoa = pessoaRepository.findById(dto.pessoaId())
                .orElseThrow(() -> new NotFoundException("Pessoa com ID " + dto.pessoaId() + " não encontrada."));

        TipoDocumento tipoDoc = tipoDocumentoRepository.findByNome(dto.tipoDocumento())
                .orElseThrow(() -> new NotFoundException(
                        "Tipo de Documento com o nome '" + dto.tipoDocumento() + "' não encontrado."));

        var user = AuthenticationUtil.retriveAuthenticatedUser();

        String conteudoEmBase64 = Base64.getEncoder().encodeToString(pdfBytes);
        String tipoDoConteudo = "application/pdf";

        Document novoDocumento = Document.builder()
                .titulo(formarTitulo(pessoa.getNome(), tipoDoc.getNome()))
                .tipoDocumento(tipoDoc)
                .pessoa(pessoa)
                .uploadedBy(user)
                .tipoConteudo(tipoDoConteudo)
                .dataDocumento(LocalDate.now())
                .isLast(true)
                .isAtivo(true)
                .validade(LocalDate.now().plusDays(tipoDoc.getValidade()))
                .localizacao(dto.localizacao())
                .build();


        DocumentContent documentContent = new DocumentContent();
        documentContent.setConteudo(conteudoEmBase64);
        documentContent.setDocument(novoDocumento);
        novoDocumento.setDocumentContent(documentContent);

        return documentRepository.save(novoDocumento);
    }

    public Page<DocumentResponseDTO> listarPorPessoa(Long pessoaId, String termoBusca, Pageable pageable) {
        Specification<Document> specFinal = Specification.where(DocumentSpecification.isLast())
                .and(DocumentSpecification.isAtivo())
                .and((root, query, cb) -> cb.equal(root.get("pessoa").get("id"), pessoaId))
                .and(DocumentSpecification.validoAte(LocalDate.now()));
        if (termoBusca != null && !termoBusca.isBlank()) {
            Specification<Document> specBuscaTitulo = (root, query, criteriaBuilder) -> criteriaBuilder
                    .like(criteriaBuilder.lower(root.get("titulo")), "%" + termoBusca.toLowerCase() + "%");
            specFinal = specFinal.and(specBuscaTitulo);
        }
        Pageable pageableComOrdenacao = pageable;
        if (pageable.getSort().isUnsorted()) {
            pageableComOrdenacao = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by("dataDocumento").descending());
        }
        Page<Document> documentPage = documentRepository.findAll(specFinal, pageableComOrdenacao);

        return documentPage.map(DocumentResponseDTO::fromEntityWithoutContent);
    }

    @Transactional
    public DocumentResponseDTO update(Long id, DocumentRequestDTO dto) throws IOException {
        Document documentoParaAtualizar = documentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Documento com ID " + id + " não encontrado."));

        if (dto.tipoDocumento() != null && !dto.tipoDocumento().isBlank()) {
            TipoDocumento tipoDoc = tipoDocumentoRepository.findByNome(dto.tipoDocumento())
                    .orElseThrow(() -> new NotFoundException(
                            "Tipo de Documento com o nome '" + dto.tipoDocumento() + "' não encontrado."));
            documentoParaAtualizar.setTipoDocumento(tipoDoc);
        }

        MultipartFile arquivo = dto.file();
        if (arquivo != null && !arquivo.isEmpty()) {
            String conteudoEmBase64 = Base64.getEncoder().encodeToString(arquivo.getBytes());
            setDocumentContent(documentoParaAtualizar, conteudoEmBase64);
            documentoParaAtualizar.setTipoConteudo(arquivo.getContentType());
        }

        if (dto.dataDocumento() != null) {
            documentoParaAtualizar.setDataDocumento(dto.dataDocumento());
        }

        if (dto.localizacao() != null && !dto.localizacao().isBlank()) {
            documentoParaAtualizar.setLocalizacao(dto.localizacao());
        }

        Document documentoAtualizado = documentRepository.save(documentoParaAtualizar);

        User user = AuthenticationUtil.retriveAuthenticatedUser();
        logService.registrarAcao(
                "INFO",
                user.getNome(),
                user.getEmail(),
                "UPDATE",
                "Documento com ID " + id + " atualizado com sucesso."
        );

        return DocumentResponseDTO.fromEntityWithoutContent(documentoAtualizado);
    }

    public void changeStatus(Long id) {
        Document documento = documentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Documento com ID " + id + " não encontrado."));

        documento.setAtivo(!documento.isAtivo());
        User user = AuthenticationUtil.retriveAuthenticatedUser();
        documento.setUpdatedBy(user);
        documento.setDataUpdate(LocalDateTime.now());

        documentRepository.save(documento);

        logService.registrarAcao(
                "INFO",
                user.getNome(),
                user.getEmail(),
                "UPDATE_STATUS",
                "Status do documento com ID " + id + " alterado para " + (documento.isAtivo() ? "ATIVO" : "INATIVO")
        );
    }

    public Page<DocumentResponseDTO> listarPermanente(Long pessoaId, String termoBusca, Pageable pageable) {
        Specification<Document> specFinal = Specification.where(DocumentSpecification.isLast())
                .and(DocumentSpecification.isAtivo())
                .and((root, query, cb) -> cb.equal(root.get("pessoa").get("id"), pessoaId))
                .and(DocumentSpecification.expirado(LocalDate.now()));
        if (termoBusca != null && !termoBusca.isBlank()) {
            Specification<Document> specBuscaTitulo = (root, query, criteriaBuilder) -> criteriaBuilder
                    .like(criteriaBuilder.lower(root.get("titulo")), "%" + termoBusca.toLowerCase() + "%");
            specFinal = specFinal.and(specBuscaTitulo);
        }
        Pageable pageableComOrdenacao = pageable;
        if (pageable.getSort().isUnsorted()) {
            pageableComOrdenacao = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by("dataDocumento").descending());
        }
        Page<Document> documentPage = documentRepository.findAll(specFinal, pageableComOrdenacao);

        return documentPage.map(DocumentResponseDTO::fromEntityWithoutContent);
    }

    @Transactional(readOnly = true)
    public DocumentResponseDTO visualizarUm(Long id) throws Exception {
        Document documento = documentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Não foi possível encontrar o documento"));

        return DocumentResponseDTO.fromEntity(documento);
    }

    @Transactional
    public void assinarSimples(Long documentoId, UserLoginDTO entrada) {
        User usuario = AuthenticationUtil.retriveAuthenticatedUser();
        if (usuario == null) {
            throw new NotFoundException("Usuário não encontrado.");
        }
        if (!passwordEncoder.matches(entrada.password(), usuario.getPassword())) {
            throw new ValidationException("Senha inválida");
        }

        Document documento = documentRepository.findById(documentoId)
                .orElseThrow(() -> new NotFoundException("Documento não encontrado"));

        boolean jaAssinou = documento.getAssinaturas().stream()
                .anyMatch(ass -> ass.getUsuario().equals(usuario));
        if (jaAssinou) {
            throw new ValidationException("Este documento já foi assinado por você.");
        }



        Assinatura novaAssinatura = pdfService.registrarAssinatura(documento, usuario, null, TipoAssinatura.SIMPLES, getDocumentBytes(documento) );
        documento.getAssinaturas().add(novaAssinatura);

        try {
            byte[] pdfOriginal = getDocumentBytes(documento);
            byte[] pdfCarimbado = pdfService.aplicarCarimbos(pdfOriginal, documento.getAssinaturas());
            String conteudoCarimbado = Base64.getEncoder().encodeToString(pdfCarimbado);
            setDocumentContent(documento, conteudoCarimbado);
        } catch (IOException e) {
            throw new RuntimeException("Falha ao aplicar carimbos de assinatura no PDF.", e);
        }

        documento.setUpdatedBy(usuario);
        documento.setDataUpdate(LocalDateTime.now());
        documentRepository.save(documento);
    }

    @Transactional
    public void iniciarAssinatura(Long documentoId, UserLoginDTO entrada) {
        User usuario = AuthenticationUtil.retriveAuthenticatedUser();
        if (usuario == null) {
            throw new SecurityException("Nenhum usuário logado");
        }
        if (!passwordEncoder.matches(entrada.password(), usuario.getPassword())) {
            throw new ValidationException("Senha inválida");
        }

        Document documento = documentRepository.findById(documentoId)
                .orElseThrow(() -> new NotFoundException("Documento não encontrado"));

        boolean jaAssinou = documento.getAssinaturas().stream()
                .anyMatch(ass -> ass.getUsuario().equals(usuario));
        if (jaAssinou) {
            throw new ValidationException("Este documento já foi assinado por você.");
        }

        String codigo = new DecimalFormat("000000").format(new Random().nextInt(999999));
        CodigoAutenticacao codigoAuth = CodigoAutenticacao.builder()
                .codigo(codigo)
                .dataExpiracao(LocalDateTime.now().plusMinutes(5))
                .usuario(usuario)
                .documento(documento)
                .build();
        codigoAutenticacaoRepository.save(codigoAuth);

        String subject = "Seu Código de Autenticação para Assinatura de Documento";
        String htmlContent = String.format("<html><body><h2>Assinatura de Documento</h2><p>Olá, %s.</p><p>Use o código a seguir para confirmar a assinatura do documento: <strong>%s</strong></p><h3 style='color: #0056b3; letter-spacing: 2px;'><strong>%s</strong></h3><p>Este código é válido por 5 minutos.</p><p>Se você não solicitou esta assinatura, por favor, ignore este e-mail.</p><br/><p>Atenciosamente,<br/>Sistema GED APAE</p></body></html>",
                usuario.getNome(), documento.getTitulo(), codigo);

        emailService.sendHtmlEmail(usuario.getEmail(), subject, htmlContent);
    }

    @Transactional
    public void confirmarAssinatura(Long documentoId, CodigoAutenticacaoDTO entrada, HttpServletRequest request) {
        User usuario = AuthenticationUtil.retriveAuthenticatedUser();

        CodigoAutenticacao codigoAuth = codigoAutenticacaoRepository
                .findByUsuarioAndDocumentoIdAndCodigo(usuario, documentoId, entrada.codigo())
                .orElseThrow(() -> new ValidationException("Código de autenticação inválido."));

        if (codigoAuth.getDataExpiracao().isBefore(LocalDateTime.now())) {
            codigoAutenticacaoRepository.delete(codigoAuth);
            throw new ValidationException("Código de autenticação expirado.");
        }

        Document documento = codigoAuth.getDocumento();
        byte[] pdfOriginalBytes = getDocumentBytes(documento);
        String ip = request.getRemoteAddr();

        Assinatura novaAssinatura = pdfService.registrarAssinatura(documento, usuario, ip, TipoAssinatura.AVANCADA, pdfOriginalBytes);
        documento.getAssinaturas().add(novaAssinatura);

        try {
            List<Assinatura> todasAssinaturas = documento.getAssinaturas();

            byte[] pdfCarimbado = pdfService.aplicarCarimbos(pdfOriginalBytes, todasAssinaturas);

            setDocumentContent(documento, Base64.getEncoder().encodeToString(pdfCarimbado));

            String novoHash = pdfService.calcularHash(pdfCarimbado);

            for (Assinatura ass : todasAssinaturas) {
                if (ass.getTipo() == TipoAssinatura.AVANCADA) {
                    ass.setHashDocumento(novoHash);
                    assinaturaRepository.save(ass);
                }
            }
        } catch (IOException | NoSuchAlgorithmException e) {
            throw new RuntimeException("Falha ao aplicar carimbos e atualizar hash de assinaturas.", e);
        }

        documento.setUpdatedBy(usuario);
        documento.setDataUpdate(LocalDateTime.now());
        documentRepository.save(documento);

        codigoAutenticacaoRepository.delete(codigoAuth);
    }

    @Transactional(readOnly = true)
    public List<VerificarAssinaturaDTO> verificarAssinaturas(Long documentoId) {
        Document documento = documentRepository.findById(documentoId)
                .orElseThrow(() -> new NotFoundException("Documento não encontrado"));

        byte[] pdfAtualBytes = getDocumentBytes(documento);
        String hashAtual;

        try {
            hashAtual = pdfService.calcularHash(pdfAtualBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erro crítico: Algoritmo de hash SHA-256 não encontrado.", e);
        }

        List<VerificarAssinaturaDTO> resultados = new ArrayList<>();
        for (Assinatura assinatura : documento.getAssinaturas()) {
            if (assinatura.getTipo() == TipoAssinatura.AVANCADA) {
                boolean isValid = hashAtual.equals(assinatura.getHashDocumento());
                String mensagem = isValid ? "Documento íntegro e válido." : "ATENÇÃO: O documento foi modificado após esta assinatura.";
                resultados.add(new VerificarAssinaturaDTO(assinatura.getUsuario().getNome(), assinatura.getDataAssinatura(), assinatura.getTipo(), isValid, mensagem));
            } else {
                resultados.add(new VerificarAssinaturaDTO(assinatura.getUsuario().getNome(), assinatura.getDataAssinatura(), assinatura.getTipo(), false, "A verificação de integridade não se aplica a assinaturas simples."));
            }
        }
        return resultados;
    }

    @Transactional(readOnly = true)
    public DownloadDTO download(Long id) {
        Document documento = documentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Documento com ID " + id + " não encontrado."));

        byte[] conteudo = getDocumentBytes(documento);
        String nomeArquivo = documento.getTitulo() + ".pdf";

        return new DownloadDTO(nomeArquivo, conteudo, documento.getTipoConteudo());
    }

    private byte[] getDocumentBytes(Document document) {
        DocumentContent content = document.getDocumentContent();
        if (content == null || content.getConteudo() == null) {
            return new byte[0];
        }
        return Base64.getDecoder().decode(content.getConteudo());
    }

    private void setDocumentContent(Document document, String base64Content) {
        DocumentContent content = document.getDocumentContent();
        if (content == null) {
            content = new DocumentContent();
            content.setDocument(document);
            document.setDocumentContent(content);
        }
        content.setConteudo(base64Content);
    }

    private String formarTitulo(String nome,String tipoDoc){
        String novoTitulo = String.format("%s - %s",
                nome,
                tipoDoc);
        return novoTitulo;
    }
}
