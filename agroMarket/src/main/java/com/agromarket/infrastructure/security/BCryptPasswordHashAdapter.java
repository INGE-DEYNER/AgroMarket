package com.agromarket.infrastructure.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.agromarket.domain.ports.out.user.PasswordHashPort;

@Component
public class BCryptPasswordHashAdapter
        implements PasswordHashPort {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public String hash(String raw) {
        return encoder.encode(raw);
    }

    @Override
    public boolean matches(
            String raw,
            String hashed) {

        return encoder.matches(raw, hashed);
    }
}