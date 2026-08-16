package com.agromarket.infrastructure.security;

import org.springframework.stereotype.Service;

@Service
public class InputSanitizerService {

    public String sanitize(
            String input) {

        if (input == null) {
            return null;
        }

        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }

    public String sanitizePlainText(
            String input) {

        if (input == null) {
            return null;
        }

        return input
                .replaceAll(
                        "[\\p{Cntrl}&&[^\r\n\t]]",
                        "")
                .trim();
    }
}