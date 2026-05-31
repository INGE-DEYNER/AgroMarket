package com.agromarket.infrastructure.security;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.stereotype.Component;

@Component
public class InputSanitizerService {
    private final PolicyFactory policy = new HtmlPolicyBuilder().toFactory();

    public String sanitize(String input) {
        if (input == null) return null;
        return policy.sanitize(input);
    }
}

