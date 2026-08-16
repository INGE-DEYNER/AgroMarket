package com.agromarket.infrastructure.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "brevo")
public class BrevoProperties {

    private Api api = new Api();
    private Sender sender = new Sender();

    @Getter
    @Setter
    public static class Api {

        private String key;
    }

    @Getter
    @Setter
    public static class Sender {

        private String email;
        private String name;
    }
}