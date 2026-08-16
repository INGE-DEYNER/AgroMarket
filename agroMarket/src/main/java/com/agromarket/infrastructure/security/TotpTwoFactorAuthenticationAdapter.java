package com.agromarket.infrastructure.security;

import org.springframework.stereotype.Component;

import com.agromarket.domain.ports.out.user.TwoFactorAuthenticationPort;

import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrDataFactory;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;

@Component
public class TotpTwoFactorAuthenticationAdapter
        implements TwoFactorAuthenticationPort {

    private static final String ISSUER = "AgroMarket";

    private final SecretGenerator secretGenerator;
    private final CodeVerifier codeVerifier;
    private final QrDataFactory qrDataFactory;

    public TotpTwoFactorAuthenticationAdapter() {

        this.secretGenerator = new DefaultSecretGenerator();

        DefaultCodeGenerator codeGenerator = new DefaultCodeGenerator(
                HashingAlgorithm.SHA1,
                6);

        this.codeVerifier = new DefaultCodeVerifier(
                codeGenerator);

        this.qrDataFactory = new QrDataFactory();
    }

    @Override
    public String generateSecret() {
        return secretGenerator.generate();
    }

    @Override
    public String generateQrCodeUri(
            String email,
            String secret) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "El email es obligatorio");
        }

        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException(
                    "El secreto TOTP es obligatorio");
        }

        QrData data = qrDataFactory.newBuilder()
                .label(email)
                .secret(secret)
                .issuer(ISSUER)
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        return data.getUri();
    }

    @Override
    public boolean verifyCode(
            String secret,
            String code) {

        if (secret == null
                || secret.isBlank()
                || code == null
                || !code.matches("\\d{6}")) {

            return false;
        }

        return codeVerifier.isValidCode(
                secret,
                code);
    }
}