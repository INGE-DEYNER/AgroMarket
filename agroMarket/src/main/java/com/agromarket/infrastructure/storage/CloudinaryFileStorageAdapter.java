package com.agromarket.infrastructure.storage;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.agromarket.domain.ports.out.image.FileStoragePort;
import com.agromarket.domain.ports.out.image.FileUploadResult;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Component
public class CloudinaryFileStorageAdapter implements FileStoragePort {

    private final Cloudinary cloudinary;

    public CloudinaryFileStorageAdapter(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {

        this.cloudinary = new Cloudinary(
                ObjectUtils.asMap(
                        "cloud_name", cloudName,
                        "api_key", apiKey,
                        "api_secret", apiSecret));
    }

    @Override
    public FileUploadResult upload(
            byte[] content,
            String fileName,
            String contentType) {

        if (this.cloudinary == null || 
            this.cloudinary.config.cloudName == null || 
            this.cloudinary.config.cloudName.isBlank() ||
            this.cloudinary.config.apiKey == null ||
            this.cloudinary.config.apiKey.isBlank()) {
            String base64 = java.util.Base64.getEncoder().encodeToString(content);
            String mime = (contentType != null && !contentType.isBlank()) ? contentType : "image/png";
            String dataUrl = "data:" + mime + ";base64," + base64;
            return new FileUploadResult(dataUrl, "local_" + System.currentTimeMillis());
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    content,
                    ObjectUtils.asMap(
                            "resource_type", "image",
                            "use_filename", true,
                            "unique_filename", true,
                            "filename_override", fileName));

            return new FileUploadResult(
                    String.valueOf(result.get("secure_url")),
                    String.valueOf(result.get("public_id")));

        } catch (IOException ex) {
            throw new IllegalStateException(
                    "No fue posible subir la imagen a Cloudinary",
                    ex);
        }
    }

    @Override
    public void delete(String publicId) {
        try {
            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap("resource_type", "image"));
        } catch (IOException ex) {
            throw new IllegalStateException(
                    "No fue posible eliminar la imagen de Cloudinary",
                    ex);
        }
    }
}
