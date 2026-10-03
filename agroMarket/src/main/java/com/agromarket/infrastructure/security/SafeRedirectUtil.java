package com.agromarket.infrastructure.security;

import java.net.URI;
import java.util.List;

import org.springframework.stereotype.Component;

import com.agromarket.infrastructure.config.properties.AppProperties;

@Component
public class SafeRedirectUtil {

    private final AppProperties properties;

    public SafeRedirectUtil(
            AppProperties properties) {

        this.properties = properties;
    }

    public String validate(
            String requestedUrl,
            String fallback) {

        if (requestedUrl == null
                || requestedUrl.isBlank()) {

            return fallback;
        }

        try {
            URI uri = URI.create(requestedUrl);

            if (uri.getScheme() == null
                    || uri.getHost() == null) {

                return fallback;
            }

            String origin = uri.getScheme()
                    + "://"
                    + uri.getAuthority();

            List<String> allowed = properties
                    .getCors()
                    .getAllowedOrigins();

            if (allowed.contains(origin)) {
                return requestedUrl;
            }

            return fallback;

        } catch (IllegalArgumentException ex) {
            return fallback;
        }
    }
}