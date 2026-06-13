package com.agromarket.infrastructure.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.agromarket.config.properties.AppProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class SafeRedirectUtilTest {

    private AppProperties appProperties;
    private SafeRedirectUtil safeRedirectUtil;

    @BeforeEach
    public void setUp() {
        // Mock properties:
        // Frontend URL: https://agro-market.app
        // CORS Allowed Origins: http://localhost:5173, https://allowed-origin.net, * (to verify wildcard handling)
        appProperties = new AppProperties(
                "https://agro-market.app",
                "/tmp",
                new String[]{"http://localhost:5173", "https://allowed-origin.net", "*"}
        );
        safeRedirectUtil = new SafeRedirectUtil(appProperties);
    }

    @Test
    public void relativePaths_areAllowedAndResolvedToFrontendUrl() {
        // Relative path
        assertThat(safeRedirectUtil.getSafeRedirectUrl("/catalogo"))
                .isEqualTo("https://agro-market.app/catalogo");

        // Relative path with nested directories
        assertThat(safeRedirectUtil.getSafeRedirectUrl("/productos/123/detalles"))
                .isEqualTo("https://agro-market.app/productos/123/detalles");

        // Base slash
        assertThat(safeRedirectUtil.getSafeRedirectUrl("/"))
                .isEqualTo("https://agro-market.app/");
    }

    @Test
    public void allowedHosts_arePermitted() {
        // Primary frontend host
        assertThat(safeRedirectUtil.getSafeRedirectUrl("https://agro-market.app/catalogo"))
                .isEqualTo("https://agro-market.app/catalogo");

        // Allowed CORS origin host
        assertThat(safeRedirectUtil.getSafeRedirectUrl("https://allowed-origin.net/home"))
                .isEqualTo("https://allowed-origin.net/home");

        // Localhost development host
        assertThat(safeRedirectUtil.getSafeRedirectUrl("http://localhost:5173/dashboard"))
                .isEqualTo("http://localhost:5173/dashboard");
    }

    @Test
    public void unauthorizedHosts_areRedirectedToDefaultFrontend() {
        // Malicious external domain
        assertThat(safeRedirectUtil.getSafeRedirectUrl("https://malicious-site.com/login"))
                .isEqualTo("https://agro-market.app");

        // Famous domain not in whitelist
        assertThat(safeRedirectUtil.getSafeRedirectUrl("https://google.com"))
                .isEqualTo("https://agro-market.app");

        // Protocol-relative malicious domain
        assertThat(safeRedirectUtil.getSafeRedirectUrl("//evil.com/payload"))
                .isEqualTo("https://agro-market.app");
    }

    @Test
    public void percentEncoding_isDecodedCorrectly() {
        // Standard encoded URL
        String encodedUrl = "https%3A%2F%2Fagro-market.app%2Fcatalogo%3Fsearch%3Dfrutas";
        assertThat(safeRedirectUtil.getSafeRedirectUrl(encodedUrl))
                .isEqualTo("https://agro-market.app/catalogo?search=frutas");

        // Malicious domain encoded
        String encodedMalicious = "https%3A%2F%2Fevil-domain.com%2F";
        assertThat(safeRedirectUtil.getSafeRedirectUrl(encodedMalicious))
                .isEqualTo("https://agro-market.app");
    }

    @Test
    public void malformedPercentEncoding_fallsBackToDefaultFrontend() {
        // Invalid hex characters after percent sign
        assertThat(safeRedirectUtil.getSafeRedirectUrl("https://agro-market.app/foo%xz"))
                .isEqualTo("https://agro-market.app");

        // Trailing percent sign
        assertThat(safeRedirectUtil.getSafeRedirectUrl("https://agro-market.app/foo%"))
                .isEqualTo("https://agro-market.app");
    }

    @Test
    public void jsessionid_isExtractedAndScrubbed() {
        // Matrix parameter: ;jsessionid=...
        assertThat(safeRedirectUtil.getSafeRedirectUrl("https://agro-market.app/catalogo;jsessionid=XYZ987654"))
                .isEqualTo("https://agro-market.app/catalogo");

        // Query parameter: ?jsessionid=...
        assertThat(safeRedirectUtil.getSafeRedirectUrl("https://agro-market.app/catalogo?jsessionid=XYZ987654"))
                .isEqualTo("https://agro-market.app/catalogo");

        // Query parameter combined at the end: ?foo=bar&jsessionid=...
        assertThat(safeRedirectUtil.getSafeRedirectUrl("https://agro-market.app/catalogo?foo=bar&jsessionid=XYZ987654"))
                .isEqualTo("https://agro-market.app/catalogo?foo=bar");

        // Query parameter combined at the start: ?jsessionid=...&foo=bar
        assertThat(safeRedirectUtil.getSafeRedirectUrl("https://agro-market.app/catalogo?jsessionid=XYZ987654&foo=bar"))
                .isEqualTo("https://agro-market.app/catalogo?foo=bar");

        // Relative path with matrix jsessionid
        assertThat(safeRedirectUtil.getSafeRedirectUrl("/catalogo;jsessionid=XYZ123?id=5"))
                .isEqualTo("https://agro-market.app/catalogo?id=5");
    }

    @Test
    public void remoteHosts_areForcedToHttps() {
        // Non-localhost URL using HTTP scheme should be rewritten to HTTPS
        assertThat(safeRedirectUtil.getSafeRedirectUrl("http://allowed-origin.net/perfil"))
                .isEqualTo("https://allowed-origin.net/perfil");
    }

    @Test
    public void localHosts_areNotForcedToHttps() {
        // Localhost URL using HTTP scheme should keep HTTP scheme
        assertThat(safeRedirectUtil.getSafeRedirectUrl("http://localhost:5173/dashboard"))
                .isEqualTo("http://localhost:5173/dashboard");

        // Loopback IP using HTTP scheme should keep HTTP scheme
        assertThat(safeRedirectUtil.getSafeRedirectUrl("http://127.0.0.1:3000/"))
                .isEqualTo("http://127.0.0.1:3000/");
    }

    @Test
    public void nullOrEmptyServiceUrl_redirectsToDefaultFrontend() {
        assertThat(safeRedirectUtil.getSafeRedirectUrl(null))
                .isEqualTo("https://agro-market.app");

        assertThat(safeRedirectUtil.getSafeRedirectUrl("   "))
                .isEqualTo("https://agro-market.app");
    }
}
