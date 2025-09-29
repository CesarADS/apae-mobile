package br.apae.ged.application.services;

import br.apae.ged.application.dto.document.GerarDocumentoPessoaDTO;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class GeracaoPdfService {

    public byte[] generatePdf(GerarDocumentoPessoaDTO dto) throws IOException {
        try (PDDocument document = new PDDocument(); 
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);

            PDType0Font fontBold = loadFont(document, "/fonts/Roboto-Bold.ttf");
            PDType0Font fontRegular = loadFont(document, "/fonts/Roboto-Regular.ttf");

            float margin = 50;
            float yPosition = page.getMediaBox().getHeight() - margin;

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                if (dto.textoCabecalho() != null && !dto.textoCabecalho().isBlank()) {
                    contentStream.beginText();
                    contentStream.setFont(fontBold, 12);
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText(dto.textoCabecalho());
                    contentStream.endText();
                    yPosition -= 20;
                }
                if (dto.texto() != null && !dto.texto().isBlank()) {
                    contentStream.beginText();
                    contentStream.setFont(fontRegular, 11);
                    contentStream.newLineAtOffset(margin, yPosition - 20);

                    for (String line : dto.texto().split("\n")) {
                        contentStream.showText(line);
                        contentStream.newLine();
                    }
                    contentStream.endText();
                }
                if (dto.textoRodape() != null && !dto.textoRodape().isBlank()) {
                    contentStream.beginText();
                    contentStream.setFont(fontRegular, 10);
                    contentStream.newLineAtOffset(margin, margin);
                    contentStream.showText(dto.textoRodape());
                    contentStream.endText();
                }
            }
            document.save(out);
            return out.toByteArray();
        }
    }

    private PDType0Font loadFont(PDDocument document, String fontPath) throws IOException {
        try (InputStream is = new ClassPathResource(fontPath).getInputStream()) {
            return PDType0Font.load(document, is);
        }
    }
}
