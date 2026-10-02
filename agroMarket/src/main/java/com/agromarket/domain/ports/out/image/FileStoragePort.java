package com.agromarket.domain.ports.out.image;

public interface FileStoragePort {

    FileUploadResult upload(
            byte[] content,
            String fileName,
            String contentType);

    void delete(String publicId);
}