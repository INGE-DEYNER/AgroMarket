package com.agromarket.infrastructure.security;

import com.agromarket.infrastructure.config.properties.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class SafeRedirectUtil {
    private static final Logger log = LoggerFactory.getLogger(SafeRedirectUtil.class);

    private static final Pattern MATRIX_JSESSIONID_PATTERN = Pattern.compile(";jsessionid=([^?#&;]*)", Pattern.CASE_INSENSITIVE);
    private static final Pattern QUERY_JSESSIONID_PATTERN = Pattern.compile("[?&]jsessionid=([^?#&;]*)", Pattern.CASE_INSENSITIVE);

    private final AppProperties appProperties;

    public SafeRedirectUtil(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public String getSafeRedirectUrl(String serviceUrl) {
        if (serviceUrl == null || serviceUrl.trim().isEmpty()) {
            log.info("Service URL is empty. Redirecting to default frontend URL: {}", appProperties.frontendUrl());
            return appProperties.frontendUrl();
        }

        // 1. Decode percent encoding securely
        String decodedUrl;
        try {
            decodedUrl = URLDecoder.decode(serviceUrl, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            log.warn("Malformed URL percent-encoding: {}. Redirecting to default frontend URL.", serviceUrl);
            return appProperties.frontendUrl();
        }

        // 2. Extract and scrub jsessionid
        String cleanUrl = extractAndScrubJSessionId(decodedUrl);

        // 3. Handle relative paths
        if (cleanUrl.startsWith("/") && !cleanUrl.startsWith("//")) {
            String baseUrl = appProperties.frontendUrl();
            String resolvedUrl;
            if (baseUrl.endsWith("/") && cleanUrl.startsWith("/")) {
                resolvedUrl = baseUrl + cleanUrl.substring(1);
            } else if (!baseUrl.endsWith("/") && !cleanUrl.startsWith("/")) {
                resolvedUrl = baseUrl + "/" + cleanUrl;
            } else {
                resolvedUrl = baseUrl + cleanUrl;
            }
            log.info("Relative path detected. Resolved to: {}", resolvedUrl);
            return resolvedUrl;
        }

        // 4. Normalize absolute URL for validation
        String normalizedUrl = cleanUrl;
        if (normalizedUrl.startsWith("//")) {
            normalizedUrl = "https:" + normalizedUrl;
        } else if (!normalizedUrl.contains("://")) {
            normalizedUrl = "https://" + normalizedUrl;
        }

        // 5. Parse host and validate against whitelist
        String host = getHostFromUrl(normalizedUrl);
        if (host == null || !isAllowedHost(host)) {
            log.warn("Redirect blocked. Host '{}' is not in the allowed whitelist. Redirecting to default frontend URL: {}", 
                     host, appProperties.frontendUrl());
            return appProperties.frontendUrl();
        }

        // 6. Force HTTPS for remote (non-localhost) domains
        String finalUrl = normalizedUrl;
        if (!"localhost".equals(host) && !"127.0.0.1".equals(host)) {
            if (finalUrl.startsWith("http://")) {
                finalUrl = "https://" + finalUrl.substring(7);
                log.info("Forced HTTPS for remote host '{}'. Redirect URL: {}", host, finalUrl);
            }
        }

        log.info("Secure redirect URL validated: {}", finalUrl);
        return finalUrl;
    }

    private String extractAndScrubJSessionId(String url) {
        String extractedSessionId = null;

        // Try extracting from matrix parameter
        Matcher matrixMatcher = MATRIX_JSESSIONID_PATTERN.matcher(url);
        if (matrixMatcher.find()) {
            extractedSessionId = matrixMatcher.group(1);
        } else {
            // Try extracting from query parameter
            Matcher queryMatcher = QUERY_JSESSIONID_PATTERN.matcher(url);
            if (queryMatcher.find()) {
                extractedSessionId = queryMatcher.group(1);
            }
        }

        if (extractedSessionId != null && !extractedSessionId.isEmpty()) {
            log.info("Extracted and verified session identifier (jsessionid): {}", extractedSessionId);
        }

        // Scrub matrix parameters
        String cleanUrl = MATRIX_JSESSIONID_PATTERN.matcher(url).replaceAll("");

        // Scrub query parameters
        cleanUrl = cleanUrl.replaceAll("(?i)\\?jsessionid=[^?#&;]*&", "?");
        cleanUrl = cleanUrl.replaceAll("(?i)&jsessionid=[^?#&;]*", "");
        cleanUrl = cleanUrl.replaceAll("(?i)\\?jsessionid=[^?#&;]*", "");

        return cleanUrl;
    }

    private String getHostFromUrl(String url) {
        try {
            URI uri = new URI(url);
            return uri.getHost();
        } catch (URISyntaxException e) {
            log.warn("Failed to parse URI: {}", url);
            return null;
        }
    }

    private boolean isAllowedHost(String host) {
        if (host == null) {
            return false;
        }

        String lowerHost = host.toLowerCase();
        if ("localhost".equals(lowerHost) || "127.0.0.1".equals(lowerHost)) {
            return true;
        }

        Set<String> allowedHosts = new HashSet<>();

        String frontendHost = getHostFromUrl(appProperties.frontendUrl());
        if (frontendHost != null) {
            allowedHosts.add(frontendHost.toLowerCase());
        }

        if (appProperties.corsAllowedOrigins() != null) {
            for (String origin : appProperties.corsAllowedOrigins()) {
                String originHost = getHostFromUrl(origin);
                if (originHost != null && !originHost.equals("*")) {
                    allowedHosts.add(originHost.toLowerCase());
                }
            }
        }

        return allowedHosts.contains(lowerHost);
    }
}
