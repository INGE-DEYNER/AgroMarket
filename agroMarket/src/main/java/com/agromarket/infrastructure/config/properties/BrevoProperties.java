package com.agromarket.infrastructure.config.properties;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "brevo")
public record BrevoProperties(
    Api api,
    Sender sender
) {
    public record Api(String key) {}
    public record Sender(String email, String name) {}
}
