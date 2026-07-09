package com.agromarket.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "agromarket.jwt")
public record AgroMarketJwtProperties(long expirationMs) {
}