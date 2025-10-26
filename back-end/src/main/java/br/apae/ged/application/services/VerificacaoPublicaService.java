package br.apae.ged.application.services;

import br.apae.ged.application.dto.document.VerificarAssinaturaDTO;
import br.apae.ged.application.exceptions.NotFoundException;
import br.apae.ged.application.exceptions.ValidationException;
import br.apae.ged.domain.models.Assinatura;
import br.apae.ged.domain.models.AssinaturaInstitucional;
import br.apae.ged.domain.repositories.AssinaturaInstitucionalRepository;
import br.apae.ged.domain.repositories.AssinaturaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VerificacaoPublicaService {

    private final AssinaturaRepository assinaturaRepository;
    private final AssinaturaInstitucionalRepository assinaturaInstitucionalRepository;
    private final PdfService pdfService;

    public List<VerificarAssinaturaDTO> verificarDocumentoPublico(MultipartFile arquivo, String codigoVerificacao) throws IOException, NoSuchAlgorithmException {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ValidationException("O arquivo enviado está vazio.");
        }

        byte[] pdfBytes = arquivo.getBytes();
        String hashDoArquivoEnviado = pdfService.calcularHash(pdfBytes);

        Optional<Assinatura> assinaturaDocOpt = assinaturaRepository.findByCodigoVerificacao(codigoVerificacao);
        if (assinaturaDocOpt.isPresent()) {
            List<Assinatura> assinaturasDoDocumento = assinaturaRepository.findByDocumento(assinaturaDocOpt.get().getDocumento());

            List<Assinatura> assinaturasValidas = assinaturasDoDocumento.stream()
                .filter(a -> a.getHashDocumento() != null && a.getHashDocumento().equals(hashDoArquivoEnviado))
                .collect(Collectors.toList());

            if (assinaturasValidas.isEmpty()) {
                return new ArrayList<>();
            }

            return assinaturasValidas.stream()
                .map(assinatura -> new VerificarAssinaturaDTO(
                        assinatura.getUsuario().getNome(),
                        assinatura.getDataAssinatura(),
                        assinatura.getTipo(),
                        true,
                        "Documento autêntico e íntegro."
                ))
                .collect(Collectors.toList());
        }

        Optional<AssinaturaInstitucional> assinaturaInstOpt = assinaturaInstitucionalRepository.findByCodigoVerificacao(codigoVerificacao);
        if (assinaturaInstOpt.isPresent()) {
            List<AssinaturaInstitucional> assinaturasDoDocumento = assinaturaInstitucionalRepository.findByInstitucional(assinaturaInstOpt.get().getInstitucional());

            List<AssinaturaInstitucional> assinaturasValidas = assinaturasDoDocumento.stream()
                .filter(a -> a.getHashDocumento() != null && a.getHashDocumento().equals(hashDoArquivoEnviado))
                .collect(Collectors.toList());
            
            if (assinaturasValidas.isEmpty()) {
                return new ArrayList<>();
            }

            return assinaturasValidas.stream()
                .map(assinatura -> new VerificarAssinaturaDTO(
                        assinatura.getUsuario().getNome(),
                        assinatura.getDataAssinatura(),
                        assinatura.getTipo(),
                        true,
                        "Documento autêntico e íntegro."
                ))
                .collect(Collectors.toList());
        }

        throw new NotFoundException("Código de verificação não encontrado.");
    }
}
