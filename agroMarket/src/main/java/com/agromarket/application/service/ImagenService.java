package com.agromarket.application.service;

import org.springframework.web.multipart.MultipartFile;

public interface ImagenService {
    /**
     * Guarda la imagen del producto y devuelve la URL pública relativa.
     */
    String uploadProductoImagen(Long productoId, MultipartFile file, Long solicitanteId);
}
