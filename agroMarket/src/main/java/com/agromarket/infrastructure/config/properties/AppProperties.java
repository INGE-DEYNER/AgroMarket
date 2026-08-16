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
}