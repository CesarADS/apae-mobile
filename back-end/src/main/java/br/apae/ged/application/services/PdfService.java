package br.apae.ged.application.services;

import br.apae.ged.application.dto.document.GerarDocumentoPessoaDTO;
import br.apae.ged.domain.models.*;
import br.apae.ged.domain.models.enums.TipoAssinatura;
import br.apae.ged.domain.repositories.AssinaturaInstitucionalRepository;
import br.apae.ged.domain.repositories.AssinaturaRepository;
import com.google.zxing.WriterException;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.multipdf.LayerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.form.PDFormXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.util.Matrix;
import org.jsoup.Jsoup;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final AssinaturaRepository assinaturaRepository;
    private final AssinaturaInstitucionalRepository assinaturaInstitucionalRepository;
    private final QrCodeService qrCodeService;

    public byte[] gerarPdf(GerarDocumentoPessoaDTO dto) throws IOException {
        final float altura_cabecalho = 102f;
        final float altura_rodape = 80f;
        final float margem_horizontal = 50f;
        final float margem_acima = 15f;

        PDRectangle pageSize;
        float largura_conteudo;
        float altura_conteudo;

        try (InputStream templateStream = new ClassPathResource("/template-pdf/Timbrada.pdf").getInputStream();
             PDDocument templateDoc = Loader.loadPDF(templateStream.readAllBytes())) {
            pageSize = templateDoc.getPage(0).getMediaBox();
            largura_conteudo = pageSize.getWidth() - (2 * margem_horizontal);
            altura_conteudo = pageSize.getHeight() - altura_cabecalho - altura_rodape - margem_acima;
        }

        String html = dto.texto();
        org.jsoup.nodes.Document jsoupDoc = Jsoup.parse(html);
        for (org.jsoup.nodes.Element element : jsoupDoc.select(".ql-align-center")) {
            element.attr("style", element.attr("style") + ";text-align: center;");
            element.removeClass("ql-align-center");
        }
        for (org.jsoup.nodes.Element element : jsoupDoc.select(".ql-align-right")) {
            element.attr("style", element.attr("style") + ";text-align: right;");
            element.removeClass("ql-align-right");
        }
        for (org.jsoup.nodes.Element element : jsoupDoc.select(".ql-align-justify")) {
            element.attr("style", element.attr("style") + ";text-align: justify;");
            element.removeClass("ql-align-justify");
        }
        jsoupDoc.outputSettings().syntax(org.jsoup.nodes.Document.OutputSettings.Syntax.xml);

        jsoupDoc.head().append("<style>" +
                "@page { size: " + largura_conteudo + "pt " + altura_conteudo + "pt; margin: 0; }" +
                "body { font-family: 'Times New Roman', serif;  margin: 0; word-wrap: break-word;}" +
                "</style>");
        String xhtml = jsoupDoc.outerHtml();

        ByteArrayOutputStream contentBytes = new ByteArrayOutputStream();
        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.withHtmlContent(xhtml, null);
        builder.toStream(contentBytes);
        builder.run();

        try (InputStream templateStream = new ClassPathResource("/template-pdf/Timbrada.pdf").getInputStream();
             PDDocument templateDoc = Loader.loadPDF(templateStream.readAllBytes());
             PDDocument contentDoc = Loader.loadPDF(contentBytes.toByteArray())) {

            PDPage templateSourcePage = templateDoc.getPage(0);
            PDFormXObject templatePageForm = new PDFormXObject(templateDoc);
            templatePageForm.setResources(templateSourcePage.getResources());
            try (InputStream srcStream = templateSourcePage.getContents();
                 OutputStream formStream = templatePageForm.getContentStream().createOutputStream()) {
                if (srcStream != null) {
                    srcStream.transferTo(formStream);
                }
            }

            for (int i = 0; i < contentDoc.getNumberOfPages(); i++) {
                PDPage page;
                if (i == 0) {
                    page = templateDoc.getPage(0);
                } else {
                    PDPage newPage = new PDPage(pageSize);
                    templateDoc.addPage(newPage);
                    try (PDPageContentStream contentStream = new PDPageContentStream(templateDoc, newPage, PDPageContentStream.AppendMode.APPEND, true, true)) {
                        contentStream.drawForm(templatePageForm);
                    }
                    page = newPage;
                }
                PDPage contentSourcePage = contentDoc.getPage(i);
                PDFormXObject contentPageForm = new PDFormXObject(templateDoc);
                contentPageForm.setResources(contentSourcePage.getResources());
                try (InputStream srcStream = contentSourcePage.getContents();
                     OutputStream formStream = contentPageForm.getContentStream().createOutputStream()) {
                    if (srcStream != null) {
                        srcStream.transferTo(formStream);
                    }
                }

                try (PDPageContentStream contentStream = new PDPageContentStream(templateDoc, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    Matrix matrix = new Matrix();
                    matrix.translate(margem_horizontal, altura_rodape);
                    contentStream.transform(matrix);
                    contentStream.drawForm(contentPageForm);
                }
            }
            ByteArrayOutputStream finalPdfBytes = new ByteArrayOutputStream();
            templateDoc.save(finalPdfBytes);
            return finalPdfBytes.toByteArray();
        }
    }

    public String calcularHash(byte[] pdfBytes) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest(pdfBytes);
        return new BigInteger(1, hashBytes).toString(16);
    }

    @Transactional
    public Assinatura registrarAssinatura(Document documento, User usuario, String ip, TipoAssinatura tipo, byte[] pdfBytes) {
        Assinatura assinatura = new Assinatura();
        assinatura.setUsuario(usuario);
        assinatura.setTipo(tipo);
        assinatura.setDocumento(documento);
        assinatura.setIpSignatario(ip);

        if (pdfBytes != null) {
            try {
                String hash = calcularHash(pdfBytes);
                assinatura.setHashDocumento(hash);
            } catch (NoSuchAlgorithmException e) {
                throw new RuntimeException("Erro crítico: Algoritmo de hash SHA-256 não encontrado.", e);
            }
        }

        return assinaturaRepository.save(assinatura);
    }

    @Transactional
    public AssinaturaInstitucional registrarAssinatura(Institucional documento, User usuario, String ip, TipoAssinatura tipo, byte[] pdfBytes) {
        AssinaturaInstitucional assinatura = new AssinaturaInstitucional();
        assinatura.setUsuario(usuario);
        assinatura.setTipo(tipo);
        assinatura.setInstitucional(documento);
        assinatura.setIpSignatario(ip);

        if (pdfBytes != null) {
            try {
                String hash = calcularHash(pdfBytes);
                assinatura.setHashDocumento(hash);
            } catch (NoSuchAlgorithmException e) {
                throw new RuntimeException("Erro crítico: Algoritmo de hash SHA-256 não encontrado.", e);
            }
        }

        return assinaturaInstitucionalRepository.save(assinatura);
    }

    public byte[] aplicarCarimbos(byte[] pdfBytes, List<? extends AssinaturaBase> assinaturas) throws IOException {
        if (assinaturas == null || assinaturas.isEmpty()) {
            return pdfBytes;
        }

        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            List<Integer> pagesToRemove = new ArrayList<>();
            for (int i = 0; i < document.getNumberOfPages(); i++) {
                stripper.setStartPage(i + 1);
                stripper.setEndPage(i + 1);
                String text = stripper.getText(document);
                if (text.contains("Assinado eletronicamente de forma avançada") || text.contains("Assinatura Eletrônica de forma simples")) {
                    pagesToRemove.add(i);
                }
            }

            for (int i = pagesToRemove.size() - 1; i >= 0; i--) {
                document.removePage(pagesToRemove.get(i));
            }

            try (InputStream templateStream = new ClassPathResource("/template-pdf/Timbrada.pdf").getInputStream();
                 PDDocument templateDoc = Loader.loadPDF(templateStream.readAllBytes())) {

                PDPage templateSourcePage = templateDoc.getPage(0);
                PDRectangle pageSize = templateSourcePage.getMediaBox();

                LayerUtility layerUtility = new LayerUtility(document);
                PDFormXObject templatePageForm = layerUtility.importPageAsForm(templateDoc, templateSourcePage);

                final float altura_cabecalho = 102f;
                final float altura_rodape = 80f;
                final float margem_acima = 15f;
                final float margem_horizontal = 50f;
                final float lineSpacing = 12f;

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

                PDPageContentStream contentStream = null;
                float yPosition = 0;

                for (AssinaturaBase assinatura : assinaturas) {
                    float requiredHeight = (assinatura.getTipo() == TipoAssinatura.AVANCADA) ? (4 * lineSpacing) : (3 * lineSpacing);

                    if (contentStream == null || yPosition - requiredHeight < altura_rodape) {
                        if (contentStream != null) {
                            contentStream.close();
                        }

                        PDPage newPage = new PDPage(pageSize);
                        document.addPage(newPage);

                        contentStream = new PDPageContentStream(document, newPage, PDPageContentStream.AppendMode.APPEND, true, true);

                        contentStream.drawForm(templatePageForm);

                        yPosition = pageSize.getHeight() - altura_cabecalho - margem_acima;
                    }

                    if (assinatura.getTipo() == TipoAssinatura.AVANCADA) {
                        contentStream.beginText();
                        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                        contentStream.newLineAtOffset(margem_horizontal, yPosition);
                        contentStream.showText("Assinado eletronicamente de forma avançada");
                        contentStream.endText();
                        yPosition -= lineSpacing;

                        contentStream.beginText();
                        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                        String texto = String.format("Por: %s em %s",
                                assinatura.getUsuario().getNome(),
                                assinatura.getDataAssinatura().format(formatter));
                        contentStream.newLineAtOffset(margem_horizontal, yPosition);
                        contentStream.showText(texto);
                        contentStream.endText();
                        yPosition -= lineSpacing;

                        contentStream.beginText();
                        String verificacao = "Código de Verificação: " + assinatura.getCodigoVerificacao();
                        contentStream.newLineAtOffset(margem_horizontal, yPosition);
                        contentStream.showText(verificacao);
                        contentStream.endText();

                    } else {
                        contentStream.beginText();
                        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                        contentStream.newLineAtOffset(margem_horizontal, yPosition);
                        contentStream.showText("Assinatura Eletrônica de forma simples");
                        contentStream.endText();
                        yPosition -= lineSpacing;

                        contentStream.beginText();
                        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                        String texto = String.format("Assinado por: %s em %s | Código: %s",
                                assinatura.getUsuario().getNome(),
                                assinatura.getDataAssinatura().format(formatter),
                                assinatura.getCodigoVerificacao());
                        contentStream.newLineAtOffset(margem_horizontal, yPosition);
                        contentStream.showText(texto);
                        contentStream.endText();
                    }
                    yPosition -= (lineSpacing * 2);
                }

                if (!assinaturas.isEmpty()) {
                    try {
                        File qrCodeFile = qrCodeService.gerarQRCode();
                        PDImageXObject qrCodeImage = PDImageXObject.createFromFileByContent(qrCodeFile, document);

                        float qrCodeSize = 120f;
                        yPosition -= qrCodeSize;

                        if (contentStream == null || yPosition < altura_rodape) {
                            if (contentStream != null) {
                                contentStream.close();
                            }

                            PDPage newPage = new PDPage(pageSize);
                            document.addPage(newPage);

                            contentStream = new PDPageContentStream(document, newPage, PDPageContentStream.AppendMode.APPEND, true, true);
                            contentStream.drawForm(templatePageForm);
                            yPosition = pageSize.getHeight() - altura_cabecalho - margem_acima;
                        }

                        float xPosition = (pageSize.getWidth() - qrCodeSize) / 2;
                        contentStream.drawImage(qrCodeImage, xPosition, yPosition, qrCodeSize, qrCodeSize);
                        qrCodeFile.delete();

                    } catch (WriterException e) {
                        throw new IOException("Erro ao gerar o QR Code.", e);
                    }
                }

                if (contentStream != null) {
                    contentStream.close();
                }

                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                document.save(outputStream);
                return outputStream.toByteArray();
            }
        }
    }
}
