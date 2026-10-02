package com.agromarket.domain.ports.out.image;

public record FileUploadResult(
        String url,
        String publicId) {
}