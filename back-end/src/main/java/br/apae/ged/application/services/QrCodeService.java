package br.apae.ged.application.services;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

@Service
public class QrCodeService {
    public File gerarQRCode() throws IOException, WriterException {
        QRCodeWriter qrCode = new QRCodeWriter();
        int largura = 300;
        int altura = 300;

        BitMatrix bitMatrix = qrCode.encode("http://localhost:5173/verificacao", BarcodeFormat.QR_CODE, largura, altura);

        BufferedImage bufferedImage = new BufferedImage(largura, altura, BufferedImage.TYPE_INT_RGB);
        for (int x = 0; x < largura; x++) {
            for (int y = 0; y < altura; y++) {
                bufferedImage.setRGB(x, y, bitMatrix.get(x, y) ? 0xFF000000 : 0xFFFFFFFF);
            }
        }

        File qrCodeFile = File.createTempFile("qrcode", ".png");
        ImageIO.write(bufferedImage, "png", qrCodeFile);

        return qrCodeFile;
    }
}
