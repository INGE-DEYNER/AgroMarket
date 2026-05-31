package com.agromarket.config;

import com.agromarket.config.properties.AppProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class StartupUploadsConfig {

    private final AppProperties appProperties;

    public StartupUploadsConfig(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    @PostConstruct
    public void ensureUploads() throws IOException {
        String uploadsPath = appProperties.uploadsPath() != null ? appProperties.uploadsPath() : "uploads";
        Path root = Path.of(uploadsPath).toAbsolutePath();
        Path productos = root.resolve("productos");
        Files.createDirectories(productos);
        // Ensure System property used by ImagenServiceImpl is set
        System.setProperty("app.uploads.path", uploadsPath);
    }
}
