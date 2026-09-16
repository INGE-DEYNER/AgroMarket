// com/agromarket/infrastructure/config/properties/AppProperties.java
package com.agromarket.infrastructure.config.properties;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Cors cors = new Cors();
    private Security security = new Security();
    private OAuth2 oauth2 = new OAuth2();
    private Google google = new Google();
    private String frontendUrl;
    private Ai ai = new Ai();
    private MercadoPago mercadoPago = new MercadoPago();
    private Shipping shipping = new Shipping();
    private Scheduler scheduler = new Scheduler();

    @Getter
    @Setter
    public static class Cors {

        private List<String> allowedOrigins = new ArrayList<>();
    }

    @Getter
    @Setter
    public static class Security {

        private String idEncryptionKey;
    }

    @Getter
    @Setter
    public static class OAuth2 {

        private String successRedirect;
        private String failureRedirect;
        private String defaultRole = "BUYER";
    }

    @Getter
    @Setter
    public static class Google {

        private String clientId;
        private String clientSecret;
        private String redirectUri;
    }

    @Getter
    @Setter
    public static class Ai {

        private String geminiApiKey;
    }

    @Getter
    @Setter
    public static class MercadoPago {

        private String baseUrl;
        private String accessToken;
        private Boolean useMock;
        private String webhookUrl;
    }

    @Getter
    @Setter
    public static class Shipping {

        private Long cost;
    }

    @Getter
    @Setter
    public static class Scheduler {

        private Long promotionsDelayMs;
        private Long rfqDelayMs;
    }
}