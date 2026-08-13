package com.agromarket.application.service.impl;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.agromarket.interfaces.rest.request.ActualizarProductoRequest;
import com.agromarket.application.ports.in.ImagenService;
import com.agromarket.application.ports.in.ProductoService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImagenServiceImpl implements ImagenService {

    private final ProductoService productoService;

    private static final long MAX_SIZE = 5L * 1024L * 1024L; // 5MB
    private static final int MAX_DIM = 1200;

    @Override
    public String uploadProductoImagen(Long productoId, MultipartFile file, Long solicitanteId) {
        try {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("Archivo de imagen requerido");
            }

            if (file.getSize() > MAX_SIZE) {
                throw new IllegalArgumentException("El archivo supera el límite de 5 MB");
            }

            byte[] bytes = file.getBytes();

            ImageType type = detectImageType(bytes);
            if (type == ImageType.UNKNOWN) {
                throw new IllegalArgumentException("Formato no soportado. Solo PNG, JPEG y WEBP permitidos");
            }

            // Prepare storage folder
            String uploadsBase = System.getProperty("app.uploads.path", "uploads");
            Path uploadsRoot = Paths.get(uploadsBase, "productos").toAbsolutePath();
            Files.createDirectories(uploadsRoot);

            String ext = type == ImageType.JPEG ? "jpg" : type == ImageType.PNG ? "png" : "webp";
            String filename = UUID.randomUUID().toString() + "." + ext;
            Path target = uploadsRoot.resolve(filename);

            // Try to read image and resize when possible (PNG/JPEG)
            if (type == ImageType.PNG || type == ImageType.JPEG) {
                BufferedImage img = ImageIO.read(new ByteArrayInputStream(bytes));
                if (img != null) {
                    BufferedImage resized = resizeIfNeeded(img, MAX_DIM, MAX_DIM);
                    // Use appropriate format
                    ImageIO.write(resized, ext.equals("jpg") ? "jpg" : "png", target.toFile());
                } else {
                    // fallback: write raw bytes
                    Files.write(target, bytes);
                }
            } else {
                // For WEBP we write raw bytes (ImageIO may not support WEBP without plugin)
                Files.write(target, bytes);
            }

            String publicPath = "/uploads/productos/" + filename;

            // Update producto imagenUrl via ProductoService to validate ownership
            ActualizarProductoRequest req = ActualizarProductoRequest.builder().imagenUrl(publicPath).build();
            productoService.actualizar(productoId, req, solicitanteId);

            return publicPath;
        } catch (IOException e) {
            log.error("Error al procesar imagen", e);
            throw new RuntimeException("Error al procesar la imagen");
        }
    }

    private enum ImageType { PNG, JPEG, WEBP, UNKNOWN }

    private ImageType detectImageType(byte[] b) {
        if (b == null || b.length < 12) return ImageType.UNKNOWN;
        // PNG signature
        if ((b[0] & 0xFF) == 0x89 && (b[1] & 0xFF) == 0x50 && (b[2] & 0xFF) == 0x4E && (b[3] & 0xFF) == 0x47)
            return ImageType.PNG;
        // JPG signature: FF D8 FF
        if ((b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) return ImageType.JPEG;
        // WEBP: RIFF....WEBP
        if ((b[0] & 0xFF) == 'R' && (b[1] & 0xFF) == 'I' && (b[2] & 0xFF) == 'F' && (b[3] & 0xFF) == 'F' && (b[8] & 0xFF) == 'W' && (b[9] & 0xFF) == 'E' && (b[10] & 0xFF) == 'B' && (b[11] & 0xFF) == 'P')
            return ImageType.WEBP;
        return ImageType.UNKNOWN;
    }

    private BufferedImage resizeIfNeeded(BufferedImage src, int maxW, int maxH) {
        int w = src.getWidth();
        int h = src.getHeight();
        double scale = Math.min(1.0, Math.min((double) maxW / w, (double) maxH / h));
        if (scale >= 0.9999) return src;
        int nw = Math.max(1, (int) Math.round(w * scale));
        int nh = Math.max(1, (int) Math.round(h * scale));
        BufferedImage out = new BufferedImage(nw, nh, src.getType() == 0 ? BufferedImage.TYPE_INT_RGB : src.getType());
        Graphics2D g = out.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.drawImage(src, 0, 0, nw, nh, null);
        g.dispose();
        return out;
    }
}
